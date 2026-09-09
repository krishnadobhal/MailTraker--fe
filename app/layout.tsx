import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'mail-tracker',
  description: 'Send tracked email and read open stats',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
