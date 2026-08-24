import Link from "next/link"
import type { PuzzleRecord } from "@/lib/types"
import { PuzzlePreview } from "./PuzzlePreview"

export function PuzzleRow({ puzzle, admin = false }: { puzzle: PuzzleRecord; admin?: boolean }) {
  return <article className="puzzle">
    <PuzzlePreview rows={puzzle.rows} />
    <div><h2><Link href={admin ? `/admin/puzzles/${puzzle.code}` : `/puzzles/${puzzle.code}`}>{puzzle.name}</Link></h2>
      <div className="code">#{puzzle.code}</div>
      <p className="meta">Size: {puzzle.rows[0]?.length}×{puzzle.rows.length}<br />Author: {puzzle.author ?? "Anonymous"}<br />Added: {new Date(`${puzzle.createdAt}Z`).toLocaleDateString()}</p>
      {admin && <strong>{puzzle.status}</strong>}
    </div>
  </article>
}
