import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'WA-SHOP.Online',
  description: 'Pakistan ka #1 AI WhatsApp Reseller Platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
