
import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ThemeProvider } from '@/lib/utils/theme';

export const metadata: Metadata = {
  title: 'Nestora — Find Your Perfect Stay Near Your College',
  description: 'Find verified PGs, hostels, and rooms near your college or any searched locality. Transparent rent, direct owner contact, zero brokerage.',
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
    <html lang="en" suppressHydrationWarning className="dark">
      <head>
        <link rel="icon" type="image/png" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=localStorage.getItem('nestora_theme');if(s==='light'){document.documentElement.classList.remove('dark');document.documentElement.classList.add('light');}else{document.documentElement.classList.add('dark');document.documentElement.classList.remove('light');}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="font-sans min-h-screen flex flex-col bg-slate-50/80 text-slate-900 dark:bg-[#090d16] dark:text-slate-100 transition-colors duration-300 antialiased selection:bg-emerald-500/25 selection:text-emerald-800 dark:selection:text-emerald-300 overflow-x-hidden">
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
