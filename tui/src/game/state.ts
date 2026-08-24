import { isPuzzleSolved } from "./validation"
import type { CellState, Direction, GameState, Puzzle, Position } from "./types"

export function createEmptyCells(width: number, height: number): CellState[][] {
  return Array.from({ length: height }, () => Array<CellState>(width).fill("unknown"))
}

export function createGameState(puzzle: Puzzle, now = Date.now()): GameState {
  return {
    puzzle,
    cells: createEmptyCells(puzzle.width, puzzle.height),
    cursor: { row: 0, col: 0 },
    startedAt: now,
    completedAt: null,
  }
}

export function moveCursor(position: Position, direction: Direction, puzzle: Puzzle): Position {
  const delta = {
    up: [-1, 0], down: [1, 0], left: [0, -1], right: [0, 1],
  }[direction]
  return {
    row: Math.max(0, Math.min(puzzle.height - 1, position.row + delta[0])),
    col: Math.max(0, Math.min(puzzle.width - 1, position.col + delta[1])),
  }
}

export function transitionCell(current: CellState, action: "fill" | "mark" | "clear"): CellState {
  if (action === "clear") return "unknown"
  if (action === "fill") return current === "filled" ? "unknown" : "filled"
  return current === "marked" ? "unknown" : "marked"
}

export function updateCell(state: GameState, action: "fill" | "mark" | "clear", now = Date.now()): GameState {
  if (state.completedAt !== null) return state
  const cells = state.cells.map((row) => [...row])
  const { row, col } = state.cursor
  cells[row]![col] = transitionCell(cells[row]![col]!, action)
  const next = { ...state, cells }
  return isPuzzleSolved(state.puzzle, cells) ? { ...next, completedAt: now } : next
}

