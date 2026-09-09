import type { Metadata } from "next";
import Link from "next/link";
import { Blocks } from "lucide-react";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "DesignLoop — LLD Practice", template: "%s | DesignLoop" },
  description: "Practice low-level design with structured, evidence-backed feedback.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>
    <header className="site-header"><nav className="shell nav"><Link className="brand" href="/"><span><Blocks size={20} /></span>DesignLoop</Link><div><Link href="/#problems">Problems</Link><Link href="/history">History</Link></div></nav></header>
    {children}
    <footer><div className="shell"><span>DesignLoop</span><p>Deliberate practice for better object-oriented design.</p></div></footer>
  </body></html>;
}
