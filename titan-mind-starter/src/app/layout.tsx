import type { Metadata } from "next";
import { Geist, Geist_Mono, Archivo } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });
const archivo = Archivo({ subsets: ["latin"], variable: "--font-archivo" });

export const metadata: Metadata = {
  title: "Titan Mind",
  description: "The collective intelligence of the Titan Mastermind.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable} ${archivo.variable}`}>
      <body>
        <Header />
        {children}
      </body>
    </html>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/[.06] bg-[#07080b]/75 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link href="/" aria-label="Titan Mind home" className="font-[family-name:var(--font-archivo)] text-lg font-extrabold uppercase tracking-[-.02em]">
          Titan Mind
        </Link>
        <nav className="flex items-center gap-1 text-sm text-zinc-400">
          <Link href="/" className="rounded-lg px-3 py-2 transition hover:bg-white/[.04] hover:text-white">Ask</Link>
          <Link href="/library" className="rounded-lg px-3 py-2 transition hover:bg-white/[.04] hover:text-white">Library</Link>
          <form action="/api/auth/logout" method="post">
            <button type="submit" aria-label="Sign out" className="ml-1 rounded-xl px-3 py-2 text-zinc-400 transition hover:bg-white/[.055] hover:text-white">
              Sign out
            </button>
          </form>
        </nav>
      </div>
    </header>
  );
}
