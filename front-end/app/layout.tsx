import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
// import { Providers } from './providers';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'FixItNow | Book Trusted Home Service Professionals',
  description: 'Book top-rated local electricians, plumbers, cleaners, and mechanics in minutes.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} bg-slate-50 text-slate-900 antialiased selection:bg-blue-600 selection:text-white`}>
        {/* <Providers> */}
          <Header />
          <main>{children}</main>
          <Footer />
        {/* </Providers> */}
      </body>
    </html>
  );
}