import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import { Header } from "@/components/layout/Header";

export const metadata: Metadata = {
  title: "GrantPulse — Grant & Compliance Case Files",
  description: "Know exactly which grants you qualify for — and exactly why. Grant & Compliance Lifecycle Operating System for Indian MSMEs & NGOs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;1,6..72,400&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[var(--paper)] text-[var(--ink)] min-h-screen flex flex-col antialiased selection:bg-[var(--rule)] selection:text-[var(--ink)]">
        <AppProvider>
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <footer className="border-t border-[var(--rule)] py-9 text-[13px] text-[var(--ink-soft)] bg-[var(--paper)]">
            <div className="wrap flex justify-between flex-wrap gap-3">
              <span>GrantPulse — built for Indian MSMEs &amp; NGOs</span>
              <span className="space-x-4">
                <a href="/eligibility" className="text-[var(--ink-soft)] hover:text-[var(--ink)] underline">How matching works</a>
                <span>·</span>
                <a href="/schemes" className="text-[var(--ink-soft)] hover:text-[var(--ink)] underline">Schemes Catalog</a>
                <span>·</span>
                <a href="/pipeline" className="text-[var(--ink-soft)] hover:text-[var(--ink)] underline">Pipeline Tracker</a>
                <span>·</span>
                <a href="/compliance" className="text-[var(--ink-soft)] hover:text-[var(--ink)] underline">GFR 12-A Ledger</a>
              </span>
            </div>
          </footer>
        </AppProvider>
      </body>
    </html>
  );
}
