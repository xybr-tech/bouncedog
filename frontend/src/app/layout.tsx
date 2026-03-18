import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'BounceDog - Validação de Email | Verifique emails em tempo real',
  description: 'Valide endereços de email em tempo real. Reduza bounces, proteja sua reputação de envio e alcance caixas de entrada reais. API simples e rápida.',
  keywords: 'validação de email, verificação de email, bounce checker, API de email, higienização de lista, validar email, verificar email',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="bg-white text-gray-900 antialiased">{children}</body>
    </html>
  );
}
