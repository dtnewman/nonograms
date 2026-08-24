import type { CellState, Puzzle } from "./types"

export function calculateClues(line: readonly boolean[]): number[] {
  const clues: number[] = []
  let run = 0

  for (const filled of line) {
    if (filled) run += 1
    else if (run > 0) {
      clues.push(run)
      run = 0
    }
  }
  if (run > 0) clues.push(run)
  return clues.length > 0 ? clues : [0]
}

export function deriveClues(solution: readonly (readonly boolean[])[]): Pick<Puzzle, "rowClues" | "columnClues"> {
  const height = solution.length
  const width = solution[0]?.length ?? 0
  return {
    rowClues: solution.map(calculateClues),
    columnClues: Array.from({ length: width }, (_, col) =>
      calculateClues(Array.from({ length: height }, (_, row) => solution[row]![col]!)),
    ),
  }
}

export function cellLineClues(line: readonly CellState[]): number[] {
  return calculateClues(line.map((cell) => cell === "filled"))
}

export function isClueSatisfied(line: readonly CellState[], clues: readonly number[]): boolean {
  const current = cellLineClues(line)
  return current.length === clues.length && current.every((value, index) => value === clues[index])
}

