import { notFound, redirect } from "next/navigation"
import { PuzzlePreview } from "@/components/PuzzlePreview"
import { isAdmin } from "@/lib/auth"
import { getPuzzle } from "@/lib/db"
import { moderate } from "../../actions"

export const dynamic = "force-dynamic"
export default async function Review({ params }: { params: Promise<{ code: string }> }) {
  if (!await isAdmin()) redirect("/admin/login")
  const { code } = await params
  const puzzle = getPuzzle(code, true)
  if (!puzzle) notFound()
  return <><h1>Review {puzzle.name}</h1><div className="code">#{puzzle.code}</div><p>By {puzzle.author ?? "Anonymous"} · {puzzle.rows[0]?.length}×{puzzle.rows.length} · Status: <strong>{puzzle.status}</strong></p><div style={{ width: 420, maxWidth: "100%" }}><PuzzlePreview rows={puzzle.rows} /></div>
    <form action={moderate} className="actions"><input type="hidden" name="code" value={puzzle.code} /><button name="decision" value="approved">Approve and publish</button><button className="danger" name="decision" value="rejected">Reject</button></form></>
}
