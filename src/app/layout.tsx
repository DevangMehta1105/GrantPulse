import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

export const metadata: Metadata = {
  title: "GrantPulse | Grant & Compliance Lifecycle Operating System",
  description: "Linear-grade Grant Lifecycle OS for Indian MSMEs & NGOs: AST eligibility reasoning, Counterfactual matching, OCR vault & FSM Kanban.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="bg-[#090b10] text-slate-100 min-h-screen flex antialiased selection:bg-emerald-500 selection:text-slate-950">
        <AppProvider>
          <div className="flex w-full min-h-screen">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0 bg-[#090b10] relative">
              {/* Subtle top ambient radial glow */}
              <div className="absolute top-0 left-1/4 right-1/4 h-64 bg-gradient-to-b from-emerald-500/5 via-cyan-500/2 to-transparent pointer-events-none blur-3xl -z-10" />
              <Header />
              <main className="flex-1 p-5 md:p-8 overflow-y-auto max-w-7xl w-full mx-auto space-y-8">
                {children}
              </main>
            </div>
          </div>
        </AppProvider>
      </body>
    </html>
  );
}
