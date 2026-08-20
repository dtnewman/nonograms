import type { CellState, Puzzle } from "./types"

export function isPuzzleSolved(puzzle: Puzzle, cells: readonly (readonly CellState[])[]): boolean {
  if (cells.length !== puzzle.height) return false
  return puzzle.solution.every((row, rowIndex) =>
    cells[rowIndex]?.length === puzzle.width &&
    row.every((filled, colIndex) => (cells[rowIndex]![colIndex] === "filled") === filled),
  )
}

export function countFilled(cells: readonly (readonly CellState[])[]): number {
  return cells.reduce((total, row) => total + row.filter((cell) => cell === "filled").length, 0)
}

export function solutionFilledCount(puzzle: Puzzle): number {
  return puzzle.solution.reduce((total, row) => total + row.filter(Boolean).length, 0)
}

