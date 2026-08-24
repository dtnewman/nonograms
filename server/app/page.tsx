import { PuzzleRow } from "@/components/PuzzleRow"
import { listPuzzles } from "@/lib/db"

export const dynamic = "force-dynamic"
export default function Home() {
  const puzzles = listPuzzles()
  return <>
    <section className="intro">
      <h1>Nonograms</h1>
      <p>Play nonograms in the terminal. Requires <a href="https://bun.sh/">Bun</a> 1.2+.</p>
      <pre><code>bunx nonograms</code></pre>
      <img className="demo" src="/demo.gif" alt="Nonograms running in the terminal" />

      <h2>What is a nonogram?</h2>
      <p>A nonogram is a picture logic puzzle. Use the number clues beside each row and column to determine which cells to fill, revealing a hidden image.</p>

      <h2>Create your own puzzles</h2>
      <p>Puzzles come from nonograms.exchange and are synced and cached locally at startup, so they work offline. You can create your own puzzles and save them locally or publish them to the website. You can also use your <a href="https://openrouter.ai/docs/quickstart">OpenRouter</a> key to have AI assist you with puzzle generation.</p>
    </section>

    <section className="community">
      <h1>Community nonograms</h1><div className="tabs"><a href="/">All sizes</a><a href="/?size=5">Tiny</a><a href="/?size=10">Small</a><a href="/?size=15">Medium</a></div>
      <div className="notice">Create puzzles in the terminal client and submit them for review. Every approved puzzle can be loaded using its eight-character code.</div>
      <p>{puzzles.length} approved puzzle{puzzles.length === 1 ? "" : "s"}</p>
      {puzzles.length ? puzzles.map((puzzle) => <PuzzleRow key={puzzle.code} puzzle={puzzle} />) : <p>No approved submissions yet.</p>}
    </section>
  </>
}
