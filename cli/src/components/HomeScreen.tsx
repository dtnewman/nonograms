import type { GameState, Puzzle } from "../game/types"
import type { Theme } from "../theme"

interface HomeScreenProps {
  puzzles: Puzzle[]
  selected: number
  games: Record<string, GameState>
  theme: Theme
  notice?: string
  codeInput?: string | null
}

export function HomeScreen({ puzzles, selected, games, theme, notice, codeInput }: HomeScreenProps) {
  return (
    <box flexDirection="column" alignItems="center" gap={1}>
      <box flexDirection="column" alignItems="center">
        <text fg={theme.accent}><strong>NONOGRAMS</strong></text>
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
        {puzzles.map((puzzle, index) => {
          const saved = games[puzzle.id]
          const complete = saved?.completedAt !== null && saved?.completedAt !== undefined
          const started = saved?.cells.some((row) => row.some((cell) => cell !== "unknown")) ?? false
          const status = complete ? "Complete" : started ? "In progress" : "Not started"
          const statusColor = complete ? theme.success : started ? theme.accent : theme.clueCompleted
          const selectedRow = index === selected

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
      <box
        width={58}
        border
        borderStyle="single"
        borderColor={selected === puzzles.length ? theme.accent : theme.grid}
        backgroundColor={theme.panel}
        paddingLeft={1}
        paddingRight={1}
      >
        <text bg={selected === puzzles.length ? theme.cursor : theme.panel}>
          <span fg={selected === puzzles.length ? theme.background : theme.accent}>
            {selected === puzzles.length ? "› " : "  "}<strong>Create a puzzle</strong>{"Manual or AI".padStart(31)}
          </span>
        </text>
      </box>
      <text fg={theme.accent}><strong>New here? Press t for How to Play</strong></text>
      {notice && <text fg={theme.accent}>{notice}</text>}
      {codeInput !== null && codeInput !== undefined && <box border borderColor={theme.accent} width={36} height={3} title=" Puzzle code "><text>{codeInput}<span fg={theme.accent}>▌</span></text></box>}
      <text fg={theme.clueCompleted}>{codeInput !== null && codeInput !== undefined ? "Type 8 characters · Enter load · Esc cancel" : "↑ ↓ / j k select · Enter open · g code · u sync · q/Esc quit"}</text>
    </box>
  )
}
