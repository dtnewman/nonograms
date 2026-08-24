import type { Metadata } from "next"
import Link from "next/link"
import "./globals.css"

export const metadata: Metadata = { title: "Nonograms Exchange", description: "Community-made nonogram puzzles" }

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>
    <header><div className="shell brand">
      <Link href="/">nonograms.exchange</Link>
      <small>Community puzzle server</small>
      <a className="github-link" href="https://github.com/dtnewman/nonograms" target="_blank" rel="noreferrer noopener" aria-label="Nonograms on GitHub" title="View on GitHub">
        <svg aria-hidden="true" viewBox="0 0 24 24"><path fill="currentColor" d="M12 .7a11.5 11.5 0 0 0-3.64 22.41c.58.11.79-.25.79-.56v-2.23c-3.23.7-3.91-1.37-3.91-1.37-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.71.08-.71 1.17.08 1.78 1.2 1.78 1.2 1.04 1.77 2.72 1.26 3.38.96.1-.75.4-1.26.74-1.55-2.58-.29-5.29-1.29-5.29-5.69 0-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.47.11-3.05 0 0 .97-.31 3.16 1.18a10.94 10.94 0 0 1 5.76 0c2.19-1.49 3.15-1.18 3.15-1.18.63 1.58.23 2.76.11 3.05.74.8 1.19 1.83 1.19 3.09 0 4.42-2.72 5.39-5.31 5.68.42.36.79 1.07.79 2.16v3.2c0 .31.21.68.8.56A11.5 11.5 0 0 0 12 .7Z" /></svg>
      </a>
    </div></header>
    <div className="shell layout">
      <nav><Link href="/">Puzzles</Link><Link href="/about">How to submit</Link><Link href="/admin">Admin</Link></nav>
      <main>{children}</main>
    </div>
  </body></html>
}
