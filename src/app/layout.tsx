import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import { Blocks } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "DesignLoop — LLD Practice", template: "%s | DesignLoop" },
  description: "Practice low-level design with structured, evidence-backed feedback.",
};

const themeBootstrap = `
  try {
    const savedTheme = localStorage.getItem("designloop-theme");
    const theme = savedTheme === "light" || savedTheme === "dark"
      ? savedTheme
      : matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  } catch {}
`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body>
        <Script id="theme-bootstrap" strategy="beforeInteractive">
          {themeBootstrap}
        </Script>
        <header className="site-header">
          <nav aria-label="Main navigation" className="shell nav">
            <Link className="brand" href="/">
              <span><Blocks size={20} /></span>
              DesignLoop
            </Link>
            <div className="nav-actions">
              <Link href="/#problems">Problems</Link>
              <Link href="/history">History</Link>
              <ThemeToggle />
            </div>
          </nav>
        </header>
        {children}
        <footer>
          <div className="shell">
            <span>DesignLoop</span>
            <p>Deliberate practice for better object-oriented design.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
