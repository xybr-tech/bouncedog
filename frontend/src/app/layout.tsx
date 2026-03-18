import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'BounceDog - Email Validation API',
  description: 'Validate email addresses in real-time. Reduce bounces, protect your sender reputation, and reach real inboxes.',
  keywords: 'email validation, email verification, bounce checker, email API, email hygiene',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white text-gray-900 antialiased">{children}</body>
    </html>
  );
}
