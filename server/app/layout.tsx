import type { Metadata } from "next"
import Link from "next/link"
import { Nav } from "@/components/Nav"
import "./globals.css"

export const metadata: Metadata = { title: "Nonograms Exchange", description: "Community-made nonogram puzzles" }

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>
    <header><div className="shell brand"><Link href="/">nonograms.exchange</Link><small>Community puzzle server</small></div></header>
    <div className="shell layout">
      <Nav />
      <main>{children}</main>
    </div>
  </body></html>
}
