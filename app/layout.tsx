import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ThemeProvider } from '@/lib/utils/theme';

export const metadata: Metadata = {
  title: 'Nestora — Find Your Perfect Stay Near Your College',
  description: 'Find verified PGs, hostels, and rooms near your college or any searched locality. Transparent rent, direct owner contact, zero brokerage.',
  verification: {
    google: '68fjs0gylVfseLdWyxfF4NWhvFFbZcAhWvJInMjUUMA',
  },
  icons: {
    icon: [
      { url: '/favicon.png', type: 'image/png' },
      { url: '/logo.png', type: 'image/png' },
    ],
    shortcut: '/favicon.png',
    apple: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="dark scroll-smooth">
      <head>
        <link rel="icon" type="image/png" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=localStorage.getItem('nestora_theme');if(s==='light'){document.documentElement.classList.remove('dark');document.documentElement.classList.add('light');}else{document.documentElement.classList.add('dark');document.documentElement.classList.remove('light');}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="font-sans min-h-screen flex flex-col bg-[var(--bg-gradient)] text-[var(--ink)] transition-colors duration-300 antialiased selection:bg-[#7B5EA7]/25 selection:text-[#4B2E83] dark:selection:text-[#D9C8F0] overflow-x-hidden relative">
        {/* Ambient Soft Lilac Glass Blobs & Tiny Sparkle (✦) Background Decorations */}
        <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden" aria-hidden="true">
          {/* Top-right soft lilac blurred circle */}
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[#D9C8F0]/40 dark:bg-[#7B5EA7]/15 blur-3xl" />
          {/* Top-left lavender accent */}
          <div className="absolute top-1/4 -left-32 w-80 h-80 rounded-full bg-[#E6DAF5]/60 dark:bg-[#4B2E83]/15 blur-3xl" />
          {/* Mid-screen floating soft lilac orb */}
          <div className="absolute top-2/3 right-10 w-96 h-96 rounded-full bg-[#D9C8F0]/30 dark:bg-[#7B5EA7]/10 blur-3xl" />
          {/* Bottom-left lilac orb */}
          <div className="absolute bottom-10 -left-20 w-80 h-80 rounded-full bg-[#E6DAF5]/50 dark:bg-[#4B2E83]/10 blur-3xl" />

          {/* Tiny sparkle (✦) decorations */}
          <span className="absolute top-24 left-[15%] text-[#7B5EA7]/30 dark:text-[#D9C8F0]/20 text-lg select-none">✦</span>
          <span className="absolute top-48 right-[18%] text-[#7B5EA7]/25 dark:text-[#D9C8F0]/20 text-sm select-none">✦</span>
          <span className="absolute top-[42%] left-[8%] text-[#7B5EA7]/20 dark:text-[#D9C8F0]/15 text-xs select-none">✦</span>
          <span className="absolute top-[58%] right-[12%] text-[#7B5EA7]/30 dark:text-[#D9C8F0]/20 text-base select-none">✦</span>
          <span className="absolute top-[75%] left-[22%] text-[#7B5EA7]/25 dark:text-[#D9C8F0]/15 text-sm select-none">✦</span>
          <span className="absolute top-[88%] right-[25%] text-[#7B5EA7]/20 dark:text-[#D9C8F0]/15 text-xs select-none">✦</span>
        </div>

        <ThemeProvider>
          <Navbar />
          <div className="flex-1 w-full max-w-full min-w-0">
            {children}
          </div>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
