'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { api, saveAuth, isLoggedIn } from '@/lib/api';

function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isRegister, setIsRegister] = useState(searchParams.get('mode') === 'register');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isLoggedIn()) router.push('/dashboard');
  }, [router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = isRegister
        ? await api.register(email, password, name || undefined)
        : await api.login(email, password);
      saveAuth(data);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
      <h2 className="text-xl font-semibold mb-6 text-dog-800">
        {isRegister ? 'Crie sua conta' : 'Bem-vindo de volta'}
      </h2>

      <form onSubmit={submit} className="space-y-4">
        {isRegister && (
          <div>
            <label className="block text-sm font-medium text-dog-500 mb-1">Nome</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-dog-200 rounded-lg focus:ring-2 focus:ring-brand-400 focus:border-transparent outline-none"
              placeholder="Seu nome" />
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-dog-500 mb-1">Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
            className="w-full px-3 py-2 border border-dog-200 rounded-lg focus:ring-2 focus:ring-brand-400 focus:border-transparent outline-none"
            placeholder="voce@empresa.com.br" />
        </div>
        <div>
          <label className="block text-sm font-medium text-dog-500 mb-1">Senha</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8}
            className="w-full px-3 py-2 border border-dog-200 rounded-lg focus:ring-2 focus:ring-brand-400 focus:border-transparent outline-none"
            placeholder={isRegister ? 'Mínimo 8 caracteres' : '••••••••'} />
        </div>
        {error && <div className="text-brand-600 text-sm bg-brand-50 p-2 rounded">{error}</div>}
        <button type="submit" disabled={loading}
          className="w-full py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50">
          {loading ? 'Carregando...' : isRegister ? 'Criar Conta' : 'Entrar'}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-dog-400">
        {isRegister ? (
          <>Já tem uma conta? <button onClick={() => setIsRegister(false)} className="text-brand-500 font-medium hover:underline">Entrar</button></>
        ) : (
          <>Não tem uma conta? <button onClick={() => setIsRegister(true)} className="text-brand-500 font-medium hover:underline">Cadastre-se grátis</button></>
        )}
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-dog-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3">
            <Image src="/logo.jpg" alt="BounceDog" width={48} height={48} className="rounded-lg" />
            <span className="text-2xl font-bold text-dog-800">BounceDog</span>
          </Link>
        </div>
        <Suspense fallback={<div className="text-center text-dog-400">Carregando...</div>}>
          <AuthForm />
        </Suspense>
      </div>
    </div>
  );
}
