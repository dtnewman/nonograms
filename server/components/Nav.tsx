"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const links = [
  { href: "/", label: "Home" },
  { href: "/puzzles", label: "Puzzles" },
  { href: "/about", label: "How to submit" },
  { href: "/admin", label: "Admin" },
]

export function Nav() {
  const pathname = usePathname()

  return <nav>
    {links.map(({ href, label }) => {
      const active = href === "/" ? pathname === href : pathname.startsWith(href)
      return <Link key={href} href={href} aria-current={active ? "page" : undefined}>{label}</Link>
    })}
    <a href="https://github.com/dtnewman/nonograms" target="_blank" rel="noreferrer noopener">GitHub</a>
  </nav>
}
