import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'WA-SHOP.Online',
  description: 'Pakistan ka #1 AI WhatsApp Reseller Platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Set the theme before first paint so there is no flash of the wrong theme.
  const themeScript = `(function(){try{var t=localStorage.getItem('wa_theme')||'light';document.documentElement.setAttribute('data-theme',t);}catch(e){document.documentElement.setAttribute('data-theme','light');}})();`;
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#008069" />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
