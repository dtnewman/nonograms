export function PuzzlePreview({ rows }: { rows: string[] }) {
  const width = rows[0]?.length ?? 1
  return <div className="preview" style={{ gridTemplateColumns: `repeat(${width}, 1fr)` }} aria-label="Puzzle solution preview">
    {rows.flatMap((row, y) => [...row].map((cell, x) => <span className={`cell ${cell === "#" ? "on" : ""}`} key={`${x}-${y}`} />))}
  </div>
}
