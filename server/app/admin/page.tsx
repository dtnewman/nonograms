import { redirect } from "next/navigation"
import { PuzzleRow } from "@/components/PuzzleRow"
import { isAdmin } from "@/lib/auth"
import { listPuzzles } from "@/lib/db"
import { logout } from "./actions"

export const dynamic = "force-dynamic"
export default async function Admin() {
  if (!await isAdmin()) redirect("/admin/login")
  const pending = listPuzzles("pending")
  const published = listPuzzles("approved")
  const takenDown = listPuzzles("rejected")
  return <><h1>Puzzle administration</h1><form action={logout}><button type="submit">Log out</button></form>
    <section className="admin-section"><h2>Submission queue</h2><div className="notice">{pending.length} puzzle{pending.length === 1 ? "" : "s"} awaiting review.</div>{pending.map((puzzle) => <PuzzleRow key={puzzle.code} puzzle={puzzle} admin />)}</section>
    <section className="admin-section"><h2>Published ({published.length})</h2>{published.length ? published.map((puzzle) => <PuzzleRow key={puzzle.code} puzzle={puzzle} admin />) : <p>No published puzzles.</p>}</section>
    <section className="admin-section"><h2>Taken down ({takenDown.length})</h2>{takenDown.length ? takenDown.map((puzzle) => <PuzzleRow key={puzzle.code} puzzle={puzzle} admin />) : <p>No taken-down puzzles.</p>}</section>
  </>
}
