import type { GameState, Puzzle } from "../game/types"
import type { Theme } from "../theme"

interface HomeScreenProps {
  puzzles: Puzzle[]
  selected: number
  games: Record<string, GameState>
  theme: Theme
}

export function HomeScreen({ puzzles, selected, games, theme }: HomeScreenProps) {
  return (
    <box flexDirection="column" alignItems="center" gap={1}>
      <box flexDirection="column" alignItems="center">
        <text fg={theme.accent}><strong>NONOGRAM</strong></text>
        <text fg={theme.clueCompleted}>Choose a puzzle</text>
      </box>
      <box
        width={58}
        border
        borderStyle="single"
        borderColor={theme.grid}
        backgroundColor={theme.panel}
        flexDirection="column"
        padding={1}
      >
        <text bg={selected === 0 ? theme.cursor : theme.panel}>
          <span fg={selected === 0 ? theme.background : theme.accent}>
            {selected === 0 ? "› " : "  "}{"How to play".padEnd(22)}{"Tutorial".padStart(7)}
          </span>
        </text>
        {puzzles.map((puzzle, index) => {
          const saved = games[puzzle.id]
          const complete = saved?.completedAt !== null && saved?.completedAt !== undefined
          const started = saved?.cells.some((row) => row.some((cell) => cell !== "unknown")) ?? false
          const status = complete ? "Complete" : started ? "In progress" : "Not started"
          const statusColor = complete ? theme.success : started ? theme.accent : theme.clueCompleted
          const selectedRow = index + 1 === selected

          return (
            <text key={puzzle.id} bg={selectedRow ? theme.cursor : theme.panel}>
              <span fg={selectedRow ? theme.background : theme.foreground}>
                {selectedRow ? "› " : "  "}{puzzle.name.padEnd(22)}{`${puzzle.width}×${puzzle.height}`.padStart(7)}    
              </span>
              <span fg={selectedRow ? theme.background : statusColor}> ·  {status}</span>
            </text>
          )
        })}
      </box>
      <text fg={theme.clueCompleted}>↑ ↓ / j k select  ·  Enter open  ·  t tutorial  ·  q/Esc quit</text>
    </box>
  )
}
