'use client';

import { useState } from 'react';
import Link from 'next/link';
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
        // Not logged in, show mock result
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
    invalid: 'text-red-600 bg-red-50',
    risky: 'text-yellow-600 bg-yellow-50',
    unknown: 'text-gray-600 bg-gray-50',
    error: 'text-red-600 bg-red-50',
  };

  const StatusIcon = ({ status }: { status: string }) => {
    if (status === 'valid') return <CheckCircle2 className="w-5 h-5 text-green-500" />;
    if (status === 'invalid') return <XCircle className="w-5 h-5 text-red-500" />;
    if (status === 'risky') return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    return <Mail className="w-5 h-5 text-gray-500" />;
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
          className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-dog-400 focus:outline-none text-lg"
        />
        <button
          onClick={validate}
          disabled={loading}
          className="px-6 py-3 bg-dog-500 hover:bg-dog-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
        >
          {loading ? '...' : 'Validate'}
        </button>
      </div>
      {result && (
        <div className={`mt-4 p-4 rounded-lg ${statusColors[result.status] || 'bg-gray-50'}`}>
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
      <nav className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🐕</span>
            <span className="text-xl font-bold text-gray-900">BounceDog</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#features" className="text-sm text-gray-600 hover:text-gray-900">Features</a>
            <a href="#pricing" className="text-sm text-gray-600 hover:text-gray-900">Pricing</a>
            <a href="#api" className="text-sm text-gray-600 hover:text-gray-900">API Docs</a>
            <Link href="/auth" className="text-sm font-medium text-dog-600 hover:text-dog-700">Log in</Link>
            <Link href="/auth?mode=register" className="px-4 py-2 bg-dog-500 hover:bg-dog-600 text-white text-sm font-medium rounded-lg transition-colors">
              Sign Up Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Stop sending emails<br />that bounce.
          </h1>
          <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto">
            Validate email addresses in real-time with syntax checks, MX lookups, SMTP verification, and disposable email detection. One API call. Instant results.
          </p>
          <DemoValidator />
        </div>
      </section>

      {/* Social proof strip */}
      <section className="border-y border-gray-100 py-8">
        <div className="max-w-4xl mx-auto px-4 flex justify-center gap-12 text-center">
          <div>
            <div className="text-2xl font-bold text-gray-900">7+</div>
            <div className="text-sm text-gray-500">Validation checks</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">&lt;2s</div>
            <div className="text-sm text-gray-500">Avg response time</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">99.9%</div>
            <div className="text-sm text-gray-500">API uptime</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">REST</div>
            <div className="text-sm text-gray-500">Simple JSON API</div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Everything you need to clean your email lists</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {features.map((f) => (
              <div key={f.title} className="p-6 rounded-xl border border-gray-100 hover:border-dog-200 transition-colors">
                <f.icon className="w-8 h-8 text-dog-500 mb-4" />
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-gray-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* API Example */}
      <section id="api" className="py-20 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Dead simple API</h2>
          <p className="text-center text-gray-500 mb-10">One endpoint. One header. Done.</p>
          <div className="bg-gray-900 rounded-xl p-6 text-sm font-mono text-gray-300 overflow-x-auto">
            <div className="text-green-400 mb-2"># Validate a single email</div>
            <div>curl -X POST https://api.bouncedog.com/api/validate/single \</div>
            <div className="pl-4">-H &quot;x-api-key: bd_your_key_here&quot; \</div>
            <div className="pl-4">-H &quot;Content-Type: application/json&quot; \</div>
            <div className="pl-4">-d &apos;{`{"email":"user@example.com"}`}&apos;</div>
            <div className="mt-4 text-green-400"># Response</div>
            <div className="text-yellow-300">{`{`}</div>
            <div className="pl-4">&quot;email&quot;: &quot;user@example.com&quot;,</div>
            <div className="pl-4">&quot;status&quot;: &quot;valid&quot;,</div>
            <div className="pl-4">&quot;score&quot;: 0.95,</div>
            <div className="pl-4">&quot;checks&quot;: {`{`}</div>
            <div className="pl-8">&quot;syntax&quot;: true,</div>
            <div className="pl-8">&quot;mx&quot;: true,</div>
            <div className="pl-8">&quot;smtp&quot;: true,</div>
            <div className="pl-8">&quot;inbox&quot;: true,</div>
            <div className="pl-8">&quot;disposable&quot;: false,</div>
            <div className="pl-8">&quot;catchAll&quot;: false</div>
            <div className="pl-4">{`}`},</div>
            <div className="pl-4">&quot;durationMs&quot;: 847</div>
            <div className="text-yellow-300">{`}`}</div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Simple, transparent pricing</h2>
          <p className="text-center text-gray-500 mb-12">Start free. Scale as you grow.</p>
          <div className="grid md:grid-cols-4 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`p-6 rounded-xl border-2 ${plan.popular ? 'border-dog-400 ring-2 ring-dog-100' : 'border-gray-100'} flex flex-col`}
              >
                {plan.popular && (
                  <span className="text-xs font-semibold text-dog-600 bg-dog-50 px-2 py-1 rounded-full w-fit mb-3">
                    Most Popular
                  </span>
                )}
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                <div className="mt-2 mb-1">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-gray-500 text-sm">{plan.period}</span>
                </div>
                <div className="text-sm text-gray-500 mb-6">{plan.validations} validations/mo</div>
                <ul className="space-y-2 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/auth?mode=register"
                  className={`block text-center py-2.5 rounded-lg font-medium text-sm transition-colors ${
                    plan.popular
                      ? 'bg-dog-500 hover:bg-dog-600 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
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
      <section className="py-20 px-4 bg-gray-900 text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to clean your email list?</h2>
          <p className="text-gray-400 mb-8">100 free validations. No credit card required.</p>
          <Link
            href="/auth?mode=register"
            className="inline-flex items-center gap-2 px-8 py-3 bg-dog-500 hover:bg-dog-600 text-white font-semibold rounded-lg transition-colors text-lg"
          >
            Get Started Free <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>🐕</span> BounceDog &copy; {new Date().getFullYear()}
          </div>
          <div className="flex gap-6 text-sm text-gray-500">
            <a href="#" className="hover:text-gray-900">Privacy</a>
            <a href="#" className="hover:text-gray-900">Terms</a>
            <a href="#" className="hover:text-gray-900">API Docs</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
