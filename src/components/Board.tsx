import { isClueSatisfied } from "../game/clues"
import type { CellState, Position, Puzzle } from "../game/types"
import type { Theme } from "../theme"
import { ColumnClues } from "./Clues"

interface BoardProps {
  puzzle: Puzzle
  cells: CellState[][]
  cursor: Position
  compact: boolean
  theme: Theme
}

const horizontalLine = (width: number, strong: boolean, leftPadding: number, bottom = false) => {
  const horizontal = strong ? "━" : "─"
  const joint = strong ? "╋" : "┼"
  const left = bottom ? "╰" : strong ? "┣" : "├"
  const right = bottom ? "╯" : strong ? "┫" : "┤"
  return " ".repeat(leftPadding) + left + Array.from({ length: width }, (_, col) =>
    horizontal.repeat(2) + (col === width - 1 ? right : bottom ? ((col + 1) % 5 === 0 ? "┻" : "┴") : (col + 1) % 5 === 0 ? "╋" : joint),
  ).join("")
}

export function Board({ puzzle, cells, cursor, compact, theme }: BoardProps) {
  const rowClueWidth = Math.max(...puzzle.rowClues.map((clue) => clue.join(" ").length)) + 2
  const rowComplete = puzzle.rowClues.map((clue, row) => isClueSatisfied(cells[row]!, clue))
  const columnComplete = puzzle.columnClues.map((clue, col) =>
    isClueSatisfied(cells.map((row) => row[col]!), clue),
  )

  return (
    <box flexDirection="column">
      <ColumnClues
        clues={puzzle.columnClues}
        completed={columnComplete}
        activeColumn={cursor.col}
        leftPadding={rowClueWidth}
        theme={theme}
      />
      <text fg={theme.grid}>{" ".repeat(rowClueWidth) + "╭" + Array.from({ length: puzzle.width }, (_, col) => "──" + (col === puzzle.width - 1 ? "╮" : (col + 1) % 5 === 0 ? "┳" : "┬")).join("")}</text>
      {cells.map((row, rowIndex) => (
        <box key={rowIndex} flexDirection="column">
          <text height={1}>
            <span fg={rowComplete[rowIndex] ? theme.clueCompleted : theme.clue}>
              {puzzle.rowClues[rowIndex]!.join(" ").padStart(rowClueWidth - 1) + " "}
            </span>
            <span fg={theme.grid}>│</span>
            {row.map((cell, colIndex) => {
              const selected = cursor.row === rowIndex && cursor.col === colIndex
              const active = cursor.row === rowIndex || cursor.col === colIndex
              const bg = selected ? theme.cursor : active ? theme.activeLine : theme.cellUnknown
              const fg = selected
                ? theme.background
                : cell === "filled" ? theme.cellFilled : cell === "marked" ? theme.cellMarked : theme.foreground
              const glyph = cell === "filled" ? "██" : cell === "marked" ? " ×" : "  "
              const dividerStrong = (colIndex + 1) % 5 === 0 && colIndex < puzzle.width - 1
              return (
                <span key={colIndex}>
                  <span fg={fg} bg={bg}>{glyph}</span>
                  <span fg={dividerStrong ? theme.gridStrong : theme.grid}>{dividerStrong ? "┃" : "│"}</span>
                </span>
              )
            })}
          </text>
          {!compact && rowIndex < puzzle.height - 1 && (
            <text fg={(rowIndex + 1) % 5 === 0 ? theme.gridStrong : theme.grid}>
              {horizontalLine(puzzle.width, (rowIndex + 1) % 5 === 0, rowClueWidth)}
            </text>
          )}
          {compact && (rowIndex + 1) % 5 === 0 && rowIndex < puzzle.height - 1 && (
            <text fg={theme.gridStrong}>{horizontalLine(puzzle.width, true, rowClueWidth)}</text>
          )}
        </box>
      ))}
      <text fg={theme.grid}>{horizontalLine(puzzle.width, false, rowClueWidth, true)}</text>
    </box>
  )
}
