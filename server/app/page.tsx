import { PuzzleRow } from "@/components/PuzzleRow"
import { listPuzzles } from "@/lib/db"

export const dynamic = "force-dynamic"
export default function Home() {
  const puzzles = listPuzzles()
  return <><h1>Community nonograms</h1><div className="tabs"><a href="/">All sizes</a><a href="/?size=5">Tiny</a><a href="/?size=10">Small</a><a href="/?size=15">Medium</a></div>
    <div className="notice">Create puzzles in the terminal client and submit them for review. Every approved puzzle can be loaded using its eight-character code.</div>
    <p>{puzzles.length} approved puzzle{puzzles.length === 1 ? "" : "s"}</p>
    {puzzles.length ? puzzles.map((puzzle) => <PuzzleRow key={puzzle.code} puzzle={puzzle} />) : <p>No approved submissions yet.</p>}
  </>
}
