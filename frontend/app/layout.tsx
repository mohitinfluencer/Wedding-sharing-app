import type { Metadata } from 'next';
import { Fraunces, Outfit } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';

// ── Display font: Fraunces — editorial, emotional, luxury
const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  axes: ['SOFT', 'WONK', 'opsz'],
});

// ── UI font: Outfit — clean, geometric, modern SaaS
const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-ui',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'WeddingVault — Where Love Becomes Art',
  description:
    'Cinematic wedding media portals for photographers who care about their craft. Share moments, not just files.',
  keywords: ['wedding photography', 'wedding gallery', 'photo sharing', 'vimeo wedding', 'wedding portal'],
  openGraph: {
    title: 'WeddingVault — Where Love Becomes Art',
    description: 'Cinematic wedding media portals for photographers who care about their craft.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${outfit.variable}`} data-theme="dark" suppressHydrationWarning>
      <body suppressHydrationWarning>
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'var(--surface-glass)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '12px',
              backdropFilter: 'blur(20px)',
              fontFamily: 'var(--font-ui)',
              fontSize: '13px',
              padding: '12px 16px',
              boxShadow: 'var(--shadow-lg)',
            },
            success: {
              iconTheme: { primary: 'var(--gold)', secondary: 'var(--obsidian)' },
            },
            error: {
              iconTheme: { primary: 'var(--blush)', secondary: 'var(--obsidian)' },
            },
          }}
        />
      </body>
    </html>
  );
}
