import type { Metadata } from "next"
import Link from "next/link"
import "./globals.css"

export const metadata: Metadata = { title: "Nonograms Exchange", description: "Community-made nonogram puzzles" }

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>
    <header><div className="shell brand"><Link href="/">nonograms.exchange</Link><small>Community puzzle server</small></div></header>
    <div className="shell layout">
      <nav><Link href="/">Puzzles</Link><Link href="/about">How to submit</Link><Link href="/admin">Admin</Link><a href="https://github.com/dtnewman/nonograms" target="_blank" rel="noreferrer noopener">GitHub</a></nav>
      <main>{children}</main>
    </div>
  </body></html>
}
