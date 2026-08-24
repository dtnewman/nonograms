import type { Theme } from "../theme"

interface ColumnCluesProps {
  clues: number[][]
  completed: boolean[]
  activeColumn: number | null
  leftPadding: number
  theme: Theme
}

export function ColumnClues({ clues, completed, activeColumn, leftPadding, theme }: ColumnCluesProps) {
  const depth = Math.max(...clues.map((clue) => clue.length))

  return (
    <box flexDirection="column">
      {Array.from({ length: depth }, (_, clueRow) => (
        <text key={clueRow} height={1}>
          <span>{" ".repeat(leftPadding + 1)}</span>
          {clues.map((column, col) => {
            const value = column[clueRow - (depth - column.length)]
            const fg = completed[col] ? theme.clueCompleted : theme.clue
            const bg = col === activeColumn ? theme.activeLine : theme.background
            return (
              <span key={col} fg={fg} bg={bg}>
                {value === undefined ? "  " : String(value).padStart(2)}
                <span fg={col > 0 && col % 5 === 0 ? theme.gridStrong : theme.grid}>│</span>
              </span>
            )
          })}
        </text>
      ))}
    </box>
  )
}
