'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api, getUser, logout, isLoggedIn } from '@/lib/api';
import Image from 'next/image';
import { Mail, Key, Upload, BarChart3, CheckCircle2, XCircle, AlertTriangle, Copy, Trash2, Plus, LogOut, RefreshCw } from 'lucide-react';

type Tab = 'validate' | 'keys' | 'lists' | 'history';

function StatusBadge({ status }: { status: string }) {
  const labels: Record<string, string> = { valid: 'Válido', invalid: 'Inválido', risky: 'Arriscado', unknown: 'Desconhecido' };
  const c: Record<string, string> = { valid: 'bg-green-100 text-green-700', invalid: 'bg-red-100 text-red-700', risky: 'bg-yellow-100 text-yellow-700', unknown: 'bg-gray-100 text-gray-700' };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c[status] || c.unknown}`}>{labels[status] || status}</span>;
}

function Check({ label, value, invert, neutral }: { label: string; value: boolean; invert?: boolean; neutral?: boolean }) {
  const good = neutral ? true : invert ? !value : value;
  return (
    <div className={`flex items-center gap-2 text-sm ${good ? 'text-green-600' : 'text-red-600'}`}>
      {good ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
      {label}
    </div>
  );
}

export default function Dashboard() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('validate');
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [keys, setKeys] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [lists, setLists] = useState<any[]>([]);
  const [email, setEmail] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [keyName, setKeyName] = useState('');
  const [copied, setCopied] = useState('');

  useEffect(() => {
    if (!isLoggedIn()) { router.push('/auth'); return; }
    setUser(getUser());
    api.validationStats().then(setStats).catch(() => {});
  }, [router]);

  const loadKeys = useCallback(async () => { try { setKeys(await api.listKeys()); } catch {} }, []);
  const loadHistory = useCallback(async () => { try { setHistory(await api.validationHistory()); } catch {} }, []);
  const loadLists = useCallback(async () => { try { setLists(await api.listLists()); } catch {} }, []);

  useEffect(() => {
    if (tab === 'keys') loadKeys();
    if (tab === 'history') loadHistory();
    if (tab === 'lists') loadLists();
  }, [tab, loadKeys, loadHistory, loadLists]);

  const validate = async () => {
    if (!email) return;
    setLoading(true); setResult(null);
    try {
      setResult(await api.validate(email));
      api.validationStats().then(setStats).catch(() => {});
    } catch (err: any) { setResult({ status: 'error', reason: err.message }); }
    setLoading(false);
  };

  const createKey = async () => {
    try { await api.createKey(keyName || undefined); setKeyName(''); loadKeys(); } catch {}
  };

  const revokeKey = async (id: string) => {
    if (!confirm('Revogar esta chave de API?')) return;
    try { await api.revokeKey(id); loadKeys(); } catch {}
  };

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopied(key); setTimeout(() => setCopied(''), 2000);
  };

  const uploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try { await api.uploadList(file); loadLists(); } catch (err: any) { alert(err.message); }
  };

  const tabs = [
    { id: 'validate' as Tab, label: 'Validar', icon: Mail },
    { id: 'keys' as Tab, label: 'Chaves API', icon: Key },
    { id: 'lists' as Tab, label: 'Listas', icon: Upload },
    { id: 'history' as Tab, label: 'Histórico', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src="/logo.jpg" alt="BounceDog" width={32} height={32} className="rounded" />
            <span className="font-bold">BounceDog</span>
          </div>
          <div className="flex items-center gap-4">
            {stats && <span className="text-sm text-gray-500">{stats.used}/{stats.limit} validações ({stats.plan})</span>}
            <span className="text-sm text-gray-700">{user?.email}</span>
            <button onClick={logout} className="text-gray-400 hover:text-gray-600"><LogOut className="w-4 h-4" /></button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex gap-1 mb-6 bg-white rounded-lg border border-gray-200 p-1 w-fit">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${tab === t.id ? 'bg-brand-500 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
              <t.icon className="w-4 h-4" /> {t.label}
            </button>
          ))}
        </div>

        {tab === 'validate' && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">Validar um email</h2>
            <div className="flex gap-2 mb-6">
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && validate()} placeholder="teste@exemplo.com.br"
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-400 outline-none" />
              <button onClick={validate} disabled={loading}
                className="px-6 py-2.5 bg-dog-500 hover:bg-brand-600 text-white font-medium rounded-lg disabled:opacity-50">
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Validar'}
              </button>
            </div>
            {result && result.status !== 'error' && (
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className={`px-4 py-3 flex items-center justify-between ${result.status === 'valid' ? 'bg-green-50' : result.status === 'invalid' ? 'bg-red-50' : result.status === 'risky' ? 'bg-yellow-50' : 'bg-gray-50'}`}>
                  <div className="flex items-center gap-3">
                    {result.status === 'valid' && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                    {result.status === 'invalid' && <XCircle className="w-5 h-5 text-red-500" />}
                    {result.status === 'risky' && <AlertTriangle className="w-5 h-5 text-yellow-500" />}
                    <span className="font-medium">{result.email}</span>
                    <StatusBadge status={result.status} />
                  </div>
                  {result.score !== undefined && <span className="text-sm font-medium">Score: {Math.round(result.score * 100)}%</span>}
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Check label="Sintaxe" value={result.syntaxValid} />
                    <Check label="Registros MX" value={result.mxFound} />
                    <Check label="SMTP" value={result.smtpConnectable} />
                    <Check label="Caixa de entrada" value={result.inboxExists} />
                    <Check label="Catch-All" value={result.isCatchAll} invert />
                    <Check label="Descartável" value={result.isDisposable} invert />
                    <Check label="Conta de papel" value={result.isRoleAccount} invert />
                    <Check label="Provedor gratuito" value={result.isFreeProvider} neutral />
                  </div>
                  {result.suggestion && <p className="mt-3 text-sm text-yellow-600">Você quis dizer: <strong>{result.email.split('@')[0]}@{result.suggestion}</strong>?</p>}
                  {result.reason && result.reason !== 'OK' && <p className="mt-2 text-sm text-gray-500">{result.reason}</p>}
                  {result.durationMs && <p className="mt-1 text-xs text-gray-400">Verificado em {result.durationMs}ms</p>}
                </div>
              </div>
            )}
            {result && result.status === 'error' && <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm">{result.reason}</div>}
          </div>
        )}

        {tab === 'keys' && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">Chaves de API</h2>
            <div className="flex gap-2 mb-6">
              <input type="text" value={keyName} onChange={(e) => setKeyName(e.target.value)} placeholder="Nome da chave (opcional)"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-400" />
              <button onClick={createKey} className="flex items-center gap-1 px-4 py-2 bg-dog-500 hover:bg-brand-600 text-white font-medium rounded-lg">
                <Plus className="w-4 h-4" /> Criar Chave
              </button>
            </div>
            <div className="space-y-3">
              {keys.map((k) => (
                <div key={k.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="text-sm font-medium">{k.name}</div>
                    <code className="text-xs text-gray-500 font-mono">{k.key}</code>
                  </div>
                  <span className="text-xs text-gray-400">{k.totalValidations} usos</span>
                  <button onClick={() => copyKey(k.key)} className="text-gray-400 hover:text-gray-600">
                    <Copy className="w-4 h-4" />
                  </button>
                  {copied === k.key && <span className="text-xs text-green-500">Copiado</span>}
                  {k.active ? (
                    <button onClick={() => revokeKey(k.id)} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                  ) : <span className="text-xs text-red-400">Revogada</span>}
                </div>
              ))}
              {keys.length === 0 && <p className="text-sm text-gray-500 text-center py-6">Nenhuma chave de API ainda. Crie uma para começar.</p>}
            </div>
          </div>
        )}

        {tab === 'lists' && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">Validação em Lote</h2>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-6">
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500 mb-2">Envie um arquivo CSV ou TXT com emails (um por linha)</p>
              <label className="inline-block px-4 py-2 bg-dog-500 hover:bg-brand-600 text-white font-medium rounded-lg cursor-pointer text-sm">
                Escolher Arquivo
                <input type="file" accept=".csv,.txt" onChange={uploadFile} className="hidden" />
              </label>
            </div>
            <div className="space-y-3">
              {lists.map((l) => (
                <div key={l.id} className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="text-sm font-medium">{l.name}</div>
                    <div className="text-xs text-gray-500">{l.processed}/{l.totalEmails} processados</div>
                  </div>
                  <div className="flex gap-2 text-xs">
                    <span className="text-green-600">{l.valid} válidos</span>
                    <span className="text-red-600">{l.invalid} inválidos</span>
                    <span className="text-yellow-600">{l.risky} arriscados</span>
                  </div>
                  <StatusBadge status={l.status === 'completed' ? 'valid' : l.status} />
                </div>
              ))}
              {lists.length === 0 && <p className="text-sm text-gray-500 text-center py-6">Nenhuma lista enviada ainda.</p>}
            </div>
          </div>
        )}

        {tab === 'history' && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Histórico de Validações</h2>
              <button onClick={loadHistory} className="text-gray-400 hover:text-gray-600"><RefreshCw className="w-4 h-4" /></button>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-2 font-medium text-gray-600">Email</th>
                  <th className="text-left px-4 py-2 font-medium text-gray-600">Status</th>
                  <th className="text-left px-4 py-2 font-medium text-gray-600">Score</th>
                  <th className="text-left px-4 py-2 font-medium text-gray-600">Duração</th>
                  <th className="text-left px-4 py-2 font-medium text-gray-600">Data</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h) => (
                  <tr key={h.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-2 font-mono text-xs">{h.email}</td>
                    <td className="px-4 py-2"><StatusBadge status={h.status} /></td>
                    <td className="px-4 py-2">{Math.round(h.score * 100)}%</td>
                    <td className="px-4 py-2 text-gray-500">{h.durationMs}ms</td>
                    <td className="px-4 py-2 text-gray-500">{new Date(h.createdAt).toLocaleDateString('pt-BR')}</td>
                  </tr>
                ))}
                {history.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">Nenhuma validação ainda.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
