import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: 'mail-tracker',
  description: 'Send tracked email and read open stats',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <nav>
          <Link href="/">Send &amp; stats</Link>
          <Link href="/opens">Open events</Link>
        </nav>
        {children}
      </body>
    </html>
  );
}
