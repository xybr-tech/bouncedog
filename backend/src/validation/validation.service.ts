import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ValidationResult, ValidationStatus } from './entities/validation-result.entity';
import * as dns from 'dns';
import * as net from 'net';
import { promisify } from 'util';

const resolveMx = promisify(dns.resolveMx);
const resolve4 = promisify(dns.resolve4);

// Common disposable email domains
const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com', 'guerrillamail.com', 'tempmail.com', 'throwaway.email',
  'yopmail.com', 'sharklasers.com', 'guerrillamailblock.com', 'grr.la',
  'guerrillamail.info', 'guerrillamail.biz', 'guerrillamail.de', 'guerrillamail.net',
  'guerrillamail.org', 'spam4.me', 'trashmail.com', 'trashmail.me', 'trashmail.net',
  'dispostable.com', 'maildrop.cc', 'mailnesia.com', 'tempr.email', 'discard.email',
  'fakeinbox.com', 'mailcatch.com', 'tempail.com', 'temp-mail.org', '10minutemail.com',
  'minutemail.com', 'emailondeck.com', 'getnada.com', 'mohmal.com', 'burner.kiwi',
]);

// Common free email providers
const FREE_PROVIDERS = new Set([
  'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com',
  'icloud.com', 'mail.com', 'protonmail.com', 'zoho.com', 'yandex.com',
  'gmx.com', 'gmx.net', 'live.com', 'msn.com', 'me.com',
  'uol.com.br', 'bol.com.br', 'terra.com.br', 'ig.com.br',
]);

// Common role-based prefixes
const ROLE_PREFIXES = [
  'admin', 'info', 'support', 'sales', 'contact', 'help', 'billing',
  'abuse', 'postmaster', 'webmaster', 'noreply', 'no-reply', 'mailer-daemon',
  'marketing', 'security', 'hostmaster', 'office', 'team', 'hello',
];

@Injectable()
export class ValidationService {
  private readonly logger = new Logger(ValidationService.name);

  constructor(
    @InjectRepository(ValidationResult)
    private repo: Repository<ValidationResult>,
  ) {}

  async validateEmail(email: string, userId?: string, listId?: string): Promise<ValidationResult> {
    const start = Date.now();
    const result = this.repo.create({ email, userId, listId });

    // 1. Syntax check
    const syntaxResult = this.checkSyntax(email);
    result.syntaxValid = syntaxResult.valid;
    if (!syntaxResult.valid) {
      result.status = ValidationStatus.INVALID;
      result.reason = syntaxResult.reason;
      result.score = 0;
      result.durationMs = Date.now() - start;
      return this.repo.save(result);
    }

    const [local, domain] = email.toLowerCase().split('@');

    // 2. Check disposable
    result.isDisposable = DISPOSABLE_DOMAINS.has(domain);

    // 3. Check free provider
    result.isFreeProvider = FREE_PROVIDERS.has(domain);

    // 4. Check role account
    result.isRoleAccount = ROLE_PREFIXES.some((p) => local === p || local.startsWith(p + '.'));

    // 5. Typo suggestion
    result.suggestion = this.suggestTypo(domain);

    // 6. MX lookup
    try {
      const mxRecords = await resolveMx(domain);
      if (mxRecords && mxRecords.length > 0) {
        result.mxFound = true;
        // Sort by priority, pick lowest
        mxRecords.sort((a, b) => a.priority - b.priority);
        result.mxHost = mxRecords[0].exchange;
      }
    } catch {
      result.mxFound = false;
    }

    if (!result.mxFound) {
      // Try A record as fallback
      try {
        await resolve4(domain);
        result.mxFound = false; // No MX but domain exists
      } catch {
        result.status = ValidationStatus.INVALID;
        result.reason = 'Domain does not exist or has no mail server';
        result.score = 0;
        result.durationMs = Date.now() - start;
        return this.repo.save(result);
      }
    }

    // 7. SMTP check (if MX found)
    if (result.mxFound && result.mxHost) {
      try {
        const smtp = await this.smtpCheck(result.mxHost, email);
        result.smtpConnectable = smtp.connectable;
        result.inboxExists = smtp.inboxExists;
        result.isCatchAll = smtp.isCatchAll;
      } catch (err) {
        this.logger.warn(`SMTP check failed for ${email}: ${err.message}`);
        result.smtpConnectable = false;
      }
    }

    // Calculate score and status
    const { score, status, reason } = this.calculateScore(result);
    result.score = score;
    result.status = status;
    result.reason = reason;
    result.durationMs = Date.now() - start;

    return this.repo.save(result);
  }

  private checkSyntax(email: string): { valid: boolean; reason?: string } {
    if (!email || typeof email !== 'string') return { valid: false, reason: 'Empty email' };
    const re = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    if (!re.test(email)) return { valid: false, reason: 'Invalid email syntax' };
    const [, domain] = email.split('@');
    if (!domain || !domain.includes('.')) return { valid: false, reason: 'Invalid domain' };
    if (domain.length > 253) return { valid: false, reason: 'Domain too long' };
    return { valid: true };
  }

  private suggestTypo(domain: string): string | null {
    const corrections: Record<string, string> = {
      'gmial.com': 'gmail.com', 'gmal.com': 'gmail.com', 'gmaill.com': 'gmail.com',
      'gamil.com': 'gmail.com', 'gnail.com': 'gmail.com', 'gmai.com': 'gmail.com',
      'hotmial.com': 'hotmail.com', 'hotmal.com': 'hotmail.com', 'hotamil.com': 'hotmail.com',
      'outlok.com': 'outlook.com', 'outllok.com': 'outlook.com',
      'yaho.com': 'yahoo.com', 'yahooo.com': 'yahoo.com', 'yhaoo.com': 'yahoo.com',
    };
    return corrections[domain] || null;
  }

  private async smtpCheck(mxHost: string, email: string): Promise<{
    connectable: boolean; inboxExists: boolean; isCatchAll: boolean;
  }> {
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        socket.destroy();
        resolve({ connectable: false, inboxExists: false, isCatchAll: false });
      }, 10000);

      const socket = net.createConnection(25, mxHost);
      let step = 0;
      let data = '';
      let connectable = false;
      let inboxExists = false;
      let isCatchAll = false;

      socket.setEncoding('utf8');

      socket.on('data', (chunk: string) => {
        data += chunk;
        if (!data.includes('\r\n')) return;

        const lines = data.split('\r\n');
        data = lines.pop() || '';

        for (const line of lines) {
          const code = parseInt(line.substring(0, 3));

          if (step === 0 && code === 220) {
            connectable = true;
            socket.write('EHLO bouncedog.com\r\n');
            step = 1;
          } else if (step === 1 && code === 250) {
            socket.write('MAIL FROM:<check@bouncedog.com>\r\n');
            step = 2;
          } else if (step === 2 && code === 250) {
            socket.write(`RCPT TO:<${email}>\r\n`);
            step = 3;
          } else if (step === 3) {
            inboxExists = code === 250;
            // Check catch-all with random address
            const [, domain] = email.split('@');
            const random = `bouncedog-catchall-test-${Date.now()}@${domain}`;
            socket.write(`RCPT TO:<${random}>\r\n`);
            step = 4;
          } else if (step === 4) {
            isCatchAll = code === 250;
            socket.write('QUIT\r\n');
            step = 5;
          } else if (step === 5) {
            clearTimeout(timeout);
            socket.destroy();
            resolve({ connectable, inboxExists, isCatchAll });
          }
        }
      });

      socket.on('error', () => {
        clearTimeout(timeout);
        resolve({ connectable: false, inboxExists: false, isCatchAll: false });
      });

      socket.on('close', () => {
        clearTimeout(timeout);
        resolve({ connectable, inboxExists, isCatchAll });
      });
    });
  }

  private calculateScore(r: ValidationResult): { score: number; status: ValidationStatus; reason: string } {
    let score = 0;
    const reasons: string[] = [];

    if (r.syntaxValid) score += 0.2;
    if (r.mxFound) score += 0.2;
    if (r.smtpConnectable) score += 0.2;
    if (r.inboxExists) score += 0.3;
    if (r.isCatchAll) { score -= 0.1; reasons.push('catch-all domain'); }
    if (r.isDisposable) { score -= 0.3; reasons.push('disposable email'); }
    if (r.isRoleAccount) { score -= 0.05; reasons.push('role account'); }
    if (!r.mxFound) reasons.push('no MX records');
    if (!r.smtpConnectable) reasons.push('SMTP unreachable');
    if (!r.inboxExists && r.smtpConnectable) reasons.push('mailbox not found');

    score = Math.max(0, Math.min(1, score));
    // Add remaining 0.1 for syntax
    if (r.syntaxValid && r.mxFound && r.smtpConnectable && r.inboxExists) score = Math.min(1, score + 0.1);

    let status: ValidationStatus;
    if (score >= 0.7) status = ValidationStatus.VALID;
    else if (score >= 0.4) status = ValidationStatus.RISKY;
    else if (r.smtpConnectable === false && r.mxFound) status = ValidationStatus.UNKNOWN;
    else status = ValidationStatus.INVALID;

    return { score: Math.round(score * 100) / 100, status, reason: reasons.join('; ') || 'OK' };
  }

  async getHistory(userId: string, limit = 50, offset = 0) {
    return this.repo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
  }

  async getStats(userId: string) {
    const qb = this.repo.createQueryBuilder('v').where('v.userId = :userId', { userId });

    const total = await qb.getCount();
    const valid = await qb.andWhere('v.status = :s', { s: 'valid' }).getCount();

    return { total, valid, invalid: total - valid };
  }
}
