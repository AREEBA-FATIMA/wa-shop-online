import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'WA-SHOP.Online',
  description: 'Pakistan ka #1 AI WhatsApp Reseller Platform',
  manifest: '/manifest.webmanifest',
  applicationName: 'WA SHOP',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'WA SHOP' },
  icons: {
    icon: [{ url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
           { url: '/icon-512.png', sizes: '512x512', type: 'image/png' }],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
  },
};

export const viewport: Viewport = {
  themeColor: '#008069',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Set the theme before first paint so there is no flash of the wrong theme.
  const themeScript = `(function(){try{var t=localStorage.getItem('wa_theme')||'light';document.documentElement.setAttribute('data-theme',t);}catch(e){document.documentElement.setAttribute('data-theme','light');}})();`;
  const swScript = `if('serviceWorker' in navigator){window.addEventListener('load',function(){navigator.serviceWorker.register('/sw.js').catch(function(){});});}`;
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        {children}
        <script dangerouslySetInnerHTML={{ __html: swScript }} />
      </body>
    </html>
  );
}
