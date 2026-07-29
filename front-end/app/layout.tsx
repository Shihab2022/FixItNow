import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FixItNow | Book Trusted Home Service Professionals",
  description:
    "Book top-rated local electricians, plumbers, cleaners, and mechanics in minutes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${inter.className} bg-slate-50 text-slate-900 antialiased selection:bg-blue-600 selection:text-white`}
      >
        <main>{children}</main>
      </body>
    </html>
  );
}
