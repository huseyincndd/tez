import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Tez Egzersiz ve Ses Takip Sistemi',
  description: 'Akademik tez araştırması katılımcı seans takip ve dinleme uygulaması',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Tez Seans',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#2d6a4f',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className="h-full">
      <body className="h-full bg-[#f4f7f4] text-slate-800 antialiased selection:bg-emerald-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
