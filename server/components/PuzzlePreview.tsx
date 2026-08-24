export function PuzzlePreview({ rows, reveal = false }: { rows: string[]; reveal?: boolean }) {
  const width = rows[0]?.length ?? 1
  const height = rows.length || 1

  if (!reveal) {
    return <div
      className="preview concealed"
      style={{ "--columns": width, "--rows": height } as React.CSSProperties}
      aria-label={`Concealed ${width} by ${height} puzzle`}
    ><span aria-hidden="true">?</span></div>
  }

  return <div className="preview" style={{ gridTemplateColumns: `repeat(${width}, 1fr)` }} aria-label="Puzzle solution preview">
    {rows.flatMap((row, y) => [...row].map((cell, x) => <span className={`cell ${cell === "#" ? "on" : ""}`} key={`${x}-${y}`} />))}
  </div>
}
