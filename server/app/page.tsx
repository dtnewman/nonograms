import Link from "next/link"

export default function Home() {
  return <>
    <section className="intro">
      <h1>Nonograms</h1>
      <p>Play nonograms in the terminal. Requires <a href="https://bun.sh/">Bun</a> 1.2+.</p>
      <p>Run command:</p>
      <pre><code>bunx nonograms</code></pre>
      <img className="demo" src="/demo.gif" alt="Nonograms running in the terminal" />

      <h2>What is a nonogram?</h2>
      <p>A nonogram is a picture logic puzzle. Use the number clues beside each row and column to determine which cells to fill, revealing a hidden image.</p>

      <h2>Create your own puzzles</h2>
      <p>Puzzles come from nonograms.exchange and are synced and cached locally at startup, so they work offline. You can create your own puzzles and save them locally or publish them to the website. You can also use your <a href="https://openrouter.ai/docs/quickstart">OpenRouter</a> key to have AI assist you with puzzle generation.</p>
      <p><Link href="/puzzles">Browse community nonograms</Link></p>
    </section>
  </>
}
