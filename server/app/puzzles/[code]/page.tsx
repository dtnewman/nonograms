import { notFound } from "next/navigation"
import { PuzzlePreview } from "@/components/PuzzlePreview"
import { getPuzzle } from "@/lib/db"

export const dynamic = "force-dynamic"
export default async function PuzzlePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  const puzzle = /^[a-z0-9]{8}$/i.test(code) ? getPuzzle(code) : null
  if (!puzzle) notFound()
  return <><h1>{puzzle.name}</h1><div className="code">#{puzzle.code}</div><p>By {puzzle.author ?? "Anonymous"} · {puzzle.rows[0]?.length}×{puzzle.rows.length}</p><div style={{ width: 320, maxWidth: "100%" }}><PuzzlePreview rows={puzzle.rows} /></div></>
}
