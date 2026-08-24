import { notFound, redirect } from "next/navigation"
import { PuzzlePreview } from "@/components/PuzzlePreview"
import { isAdmin } from "@/lib/auth"
import { getPuzzle } from "@/lib/db"
import { moderate, rename } from "../../actions"

export const dynamic = "force-dynamic"
export default async function Review({ params }: { params: Promise<{ code: string }> }) {
  if (!await isAdmin()) redirect("/admin/login")
  const { code } = await params
  const puzzle = getPuzzle(code, true)
  if (!puzzle) notFound()
  return <><h1>Manage {puzzle.name}</h1><div className="code">#{puzzle.code}</div><p>By {puzzle.author ?? "Anonymous"} · {puzzle.rows[0]?.length}×{puzzle.rows.length} · Status: <strong>{puzzle.status}</strong></p><div style={{ width: 420, maxWidth: "100%" }}><PuzzlePreview rows={puzzle.rows} reveal /></div>
    <form action={rename} className="rename-form"><input type="hidden" name="code" value={puzzle.code} /><label htmlFor="puzzle-name">Puzzle name</label><div><input id="puzzle-name" name="name" defaultValue={puzzle.name} required minLength={1} maxLength={60} /><button type="submit">Rename</button></div></form>
    <form action={moderate} className="actions"><input type="hidden" name="code" value={puzzle.code} />
      {puzzle.status !== "approved" && <button name="decision" value="approved">{puzzle.status === "pending" ? "Approve and publish" : "Publish again"}</button>}
      {puzzle.status === "pending" && <button className="danger" name="decision" value="rejected">Reject</button>}
      {puzzle.status === "approved" && <button className="danger" name="decision" value="rejected">Take down</button>}
    </form></>
}
