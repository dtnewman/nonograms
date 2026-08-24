import { redirect } from "next/navigation"
import { PuzzleRow } from "@/components/PuzzleRow"
import { isAdmin } from "@/lib/auth"
import { listPuzzles } from "@/lib/db"
import { logout } from "./actions"

export const dynamic = "force-dynamic"
export default async function Admin() {
  if (!await isAdmin()) redirect("/admin/login")
  const pending = listPuzzles("pending")
  return <><h1>Submission queue</h1><form action={logout}><button type="submit">Log out</button></form><div className="notice">{pending.length} puzzle{pending.length === 1 ? "" : "s"} awaiting review.</div>{pending.map((puzzle) => <PuzzleRow key={puzzle.code} puzzle={puzzle} admin />)}</>
}
