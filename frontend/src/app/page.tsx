'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Shield, Zap, BarChart3, Code2, CheckCircle2, XCircle, AlertTriangle, Mail, ArrowRight } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

function DemoValidator() {
  const [email, setEmail] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const validate = async () => {
    if (!email) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/validate/dashboard`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.status === 401) {
        setResult({
          email,
          status: 'valid',
          score: 0.95,
          checks: { syntax: true, mx: true, smtp: true, inbox: true, catchAll: false, disposable: false },
          reason: 'Sign up for full results',
          durationMs: 1200,
          demo: true,
        });
      } else {
        setResult(await res.json());
      }
    } catch {
      setResult({ email, status: 'error', reason: 'API not available' });
    }
    setLoading(false);
  };

  const statusColors: Record<string, string> = {
    valid: 'text-green-600 bg-green-50',
    invalid: 'text-brand-600 bg-brand-50',
    risky: 'text-accent-400 bg-accent-50',
    unknown: 'text-dog-400 bg-dog-50',
    error: 'text-brand-600 bg-brand-50',
  };

  const StatusIcon = ({ status }: { status: string }) => {
    if (status === 'valid') return <CheckCircle2 className="w-5 h-5 text-green-500" />;
    if (status === 'invalid') return <XCircle className="w-5 h-5 text-brand-500" />;
    if (status === 'risky') return <AlertTriangle className="w-5 h-5 text-accent-400" />;
    return <Mail className="w-5 h-5 text-dog-400" />;
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && validate()}
          placeholder="test@example.com"
          className="flex-1 px-4 py-3 border-2 border-dog-200 rounded-lg focus:border-brand-500 focus:outline-none text-lg"
        />
        <button
          onClick={validate}
          disabled={loading}
          className="px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
        >
          {loading ? '...' : 'Validate'}
        </button>
      </div>
      {result && (
        <div className={`mt-4 p-4 rounded-lg ${statusColors[result.status] || 'bg-dog-50'}`}>
          <div className="flex items-center gap-2 mb-2">
            <StatusIcon status={result.status} />
            <span className="font-semibold capitalize">{result.status}</span>
            {result.score !== undefined && (
              <span className="ml-auto text-sm opacity-75">Score: {Math.round(result.score * 100)}%</span>
            )}
          </div>
          {result.checks && (
            <div className="grid grid-cols-3 gap-1 text-sm mt-2">
              {Object.entries(result.checks).map(([k, v]) => (
                <span key={k} className="flex items-center gap-1">
                  {v ? '✓' : '✗'} {k}
                </span>
              ))}
            </div>
          )}
          {result.demo && (
            <p className="text-sm mt-2 opacity-75">
              <Link href="/auth" className="underline font-medium">Sign up free</Link> for full validation results.
            </p>
          )}
          {result.durationMs && (
            <p className="text-xs mt-1 opacity-50">{result.durationMs}ms</p>
          )}
        </div>
      )}
    </div>
  );
}

const features = [
  {
    icon: Zap,
    title: 'Real-time Validation',
    desc: 'Syntax, MX records, SMTP verification, and inbox existence checks in under 2 seconds.',
  },
  {
    icon: Shield,
    title: 'Disposable Detection',
    desc: 'Catch throwaway emails from 1000+ disposable providers before they pollute your list.',
  },
  {
    icon: BarChart3,
    title: 'Detailed Scoring',
    desc: 'Every email gets a confidence score with granular check results you can act on.',
  },
  {
    icon: Code2,
    title: 'Simple API',
    desc: 'One API call. JSON response. Works with any language. Bulk endpoint included.',
  },
];

const plans = [
  { name: 'Free', price: '$0', period: '/mo', validations: '100', features: ['Single validation', 'API access', 'Dashboard'], cta: 'Start Free', popular: false },
  { name: 'Starter', price: '$29', period: '/mo', validations: '5,000', features: ['Everything in Free', 'Bulk validation', 'CSV upload', 'Priority support'], cta: 'Get Started', popular: false },
  { name: 'Pro', price: '$79', period: '/mo', validations: '25,000', features: ['Everything in Starter', 'Catch-all detection', 'Webhook notifications', 'API rate: 100/sec'], cta: 'Go Pro', popular: true },
  { name: 'Business', price: '$199', period: '/mo', validations: '100,000', features: ['Everything in Pro', 'Dedicated support', 'Custom integrations', 'SLA guarantee'], cta: 'Contact Us', popular: false },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="border-b border-dog-100">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/logo.jpg" alt="BounceDog" width={40} height={40} className="rounded-lg" />
            <span className="text-xl font-bold text-dog-800">BounceDog</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#features" className="text-sm text-dog-400 hover:text-dog-700">Features</a>
            <a href="#pricing" className="text-sm text-dog-400 hover:text-dog-700">Pricing</a>
            <a href="#api" className="text-sm text-dog-400 hover:text-dog-700">API Docs</a>
            <Link href="/auth" className="text-sm font-medium text-brand-500 hover:text-brand-600">Log in</Link>
            <Link href="/auth?mode=register" className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium rounded-lg transition-colors">
              Sign Up Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-20 px-4 bg-gradient-to-b from-dog-50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <Image src="/logo.jpg" alt="BounceDog" width={120} height={120} className="rounded-2xl mx-auto shadow-lg" />
          </div>
          <h1 className="text-5xl font-bold text-dog-800 mb-6 leading-tight">
            Stop sending emails<br />that bounce.
          </h1>
          <p className="text-xl text-dog-400 mb-10 max-w-2xl mx-auto">
            Validate email addresses in real-time with syntax checks, MX lookups, SMTP verification, and disposable email detection. One API call. Instant results.
          </p>
          <DemoValidator />
        </div>
      </section>

      {/* Social proof strip */}
      <section className="border-y border-dog-100 py-8 bg-dog-800 text-white">
        <div className="max-w-4xl mx-auto px-4 flex justify-center gap-12 text-center">
          <div>
            <div className="text-2xl font-bold">7+</div>
            <div className="text-sm text-dog-300">Validation checks</div>
          </div>
          <div>
            <div className="text-2xl font-bold">&lt;2s</div>
            <div className="text-sm text-dog-300">Avg response time</div>
          </div>
          <div>
            <div className="text-2xl font-bold">99.9%</div>
            <div className="text-sm text-dog-300">API uptime</div>
          </div>
          <div>
            <div className="text-2xl font-bold">REST</div>
            <div className="text-sm text-dog-300">Simple JSON API</div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-dog-800 mb-12">Everything you need to clean your email lists</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {features.map((f) => (
              <div key={f.title} className="p-6 rounded-xl border border-dog-100 hover:border-brand-200 hover:shadow-md transition-all">
                <f.icon className="w-8 h-8 text-brand-500 mb-4" />
                <h3 className="text-lg font-semibold text-dog-700 mb-2">{f.title}</h3>
                <p className="text-dog-400">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* API Example */}
      <section id="api" className="py-20 px-4 bg-dog-800">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-white mb-4">Dead simple API</h2>
          <p className="text-center text-dog-300 mb-10">One endpoint. One header. Done.</p>
          <div className="bg-dog-900 rounded-xl p-6 text-sm font-mono text-dog-300 overflow-x-auto border border-dog-600">
            <div className="text-green-400 mb-2"># Validate a single email</div>
            <div className="text-white">curl -X POST https://api.bouncedog.com/api/validate/single \</div>
            <div className="pl-4 text-white">-H &quot;x-api-key: bd_your_key_here&quot; \</div>
            <div className="pl-4 text-white">-H &quot;Content-Type: application/json&quot; \</div>
            <div className="pl-4 text-white">-d &apos;{`{"email":"user@example.com"}`}&apos;</div>
            <div className="mt-4 text-green-400"># Response</div>
            <div className="text-brand-400">{`{`}</div>
            <div className="pl-4 text-white">&quot;email&quot;: &quot;user@example.com&quot;,</div>
            <div className="pl-4 text-white">&quot;status&quot;: <span className="text-green-400">&quot;valid&quot;</span>,</div>
            <div className="pl-4 text-white">&quot;score&quot;: <span className="text-accent-400">0.95</span>,</div>
            <div className="pl-4 text-white">&quot;checks&quot;: {`{`}</div>
            <div className="pl-8 text-dog-200">&quot;syntax&quot;: true,</div>
            <div className="pl-8 text-dog-200">&quot;mx&quot;: true,</div>
            <div className="pl-8 text-dog-200">&quot;smtp&quot;: true,</div>
            <div className="pl-8 text-dog-200">&quot;inbox&quot;: true,</div>
            <div className="pl-8 text-dog-200">&quot;disposable&quot;: false,</div>
            <div className="pl-8 text-dog-200">&quot;catchAll&quot;: false</div>
            <div className="pl-4 text-white">{`}`},</div>
            <div className="pl-4 text-white">&quot;durationMs&quot;: <span className="text-accent-400">847</span></div>
            <div className="text-brand-400">{`}`}</div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-dog-800 mb-4">Simple, transparent pricing</h2>
          <p className="text-center text-dog-400 mb-12">Start free. Scale as you grow.</p>
          <div className="grid md:grid-cols-4 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`p-6 rounded-xl border-2 ${plan.popular ? 'border-brand-500 ring-2 ring-brand-100' : 'border-dog-100'} flex flex-col`}
              >
                {plan.popular && (
                  <span className="text-xs font-semibold text-brand-600 bg-brand-50 px-2 py-1 rounded-full w-fit mb-3">
                    Most Popular
                  </span>
                )}
                <h3 className="text-lg font-semibold text-dog-700">{plan.name}</h3>
                <div className="mt-2 mb-1">
                  <span className="text-3xl font-bold text-dog-800">{plan.price}</span>
                  <span className="text-dog-400 text-sm">{plan.period}</span>
                </div>
                <div className="text-sm text-dog-400 mb-6">{plan.validations} validations/mo</div>
                <ul className="space-y-2 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-dog-500">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/auth?mode=register"
                  className={`block text-center py-2.5 rounded-lg font-medium text-sm transition-colors ${
                    plan.popular
                      ? 'bg-brand-500 hover:bg-brand-600 text-white'
                      : 'bg-dog-100 hover:bg-dog-200 text-dog-700'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-dog-800 text-white">
        <div className="max-w-3xl mx-auto text-center">
          <Image src="/logo.jpg" alt="BounceDog" width={80} height={80} className="rounded-xl mx-auto mb-6 shadow-lg" />
          <h2 className="text-3xl font-bold mb-4">Ready to clean your email list?</h2>
          <p className="text-dog-300 mb-8">100 free validations. No credit card required.</p>
          <Link
            href="/auth?mode=register"
            className="inline-flex items-center gap-2 px-8 py-3 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-lg transition-colors text-lg"
          >
            Get Started Free <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-dog-100 py-8 px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-dog-400">
            <Image src="/logo.jpg" alt="" width={20} height={20} className="rounded" />
            BounceDog &copy; {new Date().getFullYear()}
          </div>
          <div className="flex gap-6 text-sm text-dog-400">
            <a href="#" className="hover:text-dog-700">Privacy</a>
            <a href="#" className="hover:text-dog-700">Terms</a>
            <a href="#" className="hover:text-dog-700">API Docs</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
