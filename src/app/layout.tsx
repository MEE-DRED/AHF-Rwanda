import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Ask AHF Rwanda',
  description: 'Ask AHF Rwanda your questions about HIV/AIDS and STIs, anonymously.',
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#921B21' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
