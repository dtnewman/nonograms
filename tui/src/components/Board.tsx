import { isClueSatisfied } from "../game/clues"
import type { CellState, Position, Puzzle } from "../game/types"
import type { Theme } from "../theme"
import { ColumnClues } from "./Clues"

// Two terminal columns are approximately one terminal row in most monospace fonts.
const cellWidth = 2

interface BoardProps {
  puzzle: Puzzle
  cells: CellState[][]
  cursor: Position
  compact: boolean
  completed?: boolean
  onCellAction?: (row: number, col: number, action: "fill" | "mark") => void
  theme: Theme
}

const horizontalLine = (width: number, strong: boolean, leftPadding: number, bottom = false) => {
  if (strong) {
    // Keep block boundaries visually calm: one uninterrupted heavy rule.
    return " ".repeat(leftPadding) + "┣" + "━".repeat(width * (cellWidth + 1) - 1) + "┫"
  }
  const horizontal = strong ? "━" : "─"
  const joint = "┼"
  const left = bottom ? "╰" : strong ? "┣" : "├"
  const right = bottom ? "╯" : strong ? "┫" : "┤"
  return " ".repeat(leftPadding) + left + Array.from({ length: width }, (_, col) =>
    horizontal.repeat(cellWidth) + (col === width - 1 ? right : bottom ? ((col + 1) % 5 === 0 ? "┻" : "┴") : (col + 1) % 5 === 0 ? "╂" : joint),
  ).join("")
}

function SeparatorLine({ width, strong, leftPadding, theme }: {
  width: number
  strong: boolean
  leftPadding: number
  theme: Theme
}) {
  if (strong) {
    return <text fg={theme.gridStrong}>{horizontalLine(width, true, leftPadding)}</text>
  }

  return (
    <text>
      <span fg={theme.grid}>{" ".repeat(leftPadding) + "├"}</span>
      {Array.from({ length: width }, (_, col) => {
        const major = (col + 1) % 5 === 0 && col < width - 1
        return (
          <span key={col}>
            <span fg={theme.grid}>{"─".repeat(cellWidth)}</span>
            <span fg={major ? theme.gridStrong : theme.grid}>{major ? "┃" : col === width - 1 ? "┤" : "┼"}</span>
          </span>
        )
      })}
    </text>
  )
}

export function Board({ puzzle, cells, cursor, compact, completed = false, onCellAction, theme }: BoardProps) {
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
        activeColumn={completed ? null : cursor.col}
        leftPadding={rowClueWidth}
        theme={theme}
      />
      <text fg={theme.grid}>{" ".repeat(rowClueWidth) + "╭" + "─".repeat(puzzle.width * (cellWidth + 1) - 1) + "╮"}</text>
      {cells.map((row, rowIndex) => (
        <box key={rowIndex} flexDirection="column">
          <text
            height={1}
            onMouseDown={(event) => {
              if (completed || (event.button !== 0 && event.button !== 2)) return
              const textX = event.currentTarget?.screenX
              if (textX === undefined) return
              const cellOffset = event.x - textX - rowClueWidth - 1
              if (cellOffset < 0) return
              const stride = cellWidth + 1
              const col = Math.floor(cellOffset / stride)
              if (col >= puzzle.width || cellOffset % stride >= cellWidth) return
              onCellAction?.(rowIndex, col, event.button === 0 ? "fill" : "mark")
            }}
          >
            <span fg={rowComplete[rowIndex] ? theme.clueCompleted : theme.clue}>
              {puzzle.rowClues[rowIndex]!.join(" ").padStart(rowClueWidth - 1) + " "}
            </span>
            <span fg={theme.grid}>│</span>
            {row.map((cell, colIndex) => {
              const selected = !completed && cursor.row === rowIndex && cursor.col === colIndex
              const active = !completed && (cursor.row === rowIndex || cursor.col === colIndex)
              const bg = selected ? theme.cursor : active ? theme.activeLine : theme.cellUnknown
              const fg = selected
                ? theme.background
                : cell === "filled" ? theme.cellFilled : cell === "marked" ? theme.cellMarked : theme.foreground
              const glyph = cell === "filled" ? "█".repeat(cellWidth) : cell === "marked" ? "Ｘ" : " ".repeat(cellWidth)
              const dividerStrong = (colIndex + 1) % 5 === 0 && colIndex < puzzle.width - 1
              return (
                <span key={colIndex}>
                  <span fg={fg} bg={bg}>{glyph}</span>
                  <span fg={dividerStrong ? theme.gridStrong : theme.grid}>{dividerStrong ? "┃" : "│"}</span>
                </span>
              )
            })}
          </text>
          {rowIndex < puzzle.height - 1 && (!compact || (rowIndex + 1) % 5 === 0) && (
            <SeparatorLine
              width={puzzle.width}
              strong={(rowIndex + 1) % 5 === 0}
              leftPadding={rowClueWidth}
              theme={theme}
            />
          )}
        </box>
      ))}
      <text fg={theme.grid}>{horizontalLine(puzzle.width, false, rowClueWidth, true)}</text>
    </box>
  )
}
