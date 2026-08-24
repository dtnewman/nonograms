export type CellState = "unknown" | "filled" | "marked"

export interface Position {
  row: number
  col: number
}

export interface Puzzle {
  id: string
  name: string
  width: number
  height: number
  solution: boolean[][]
  rowClues: number[][]
  columnClues: number[][]
}

export interface GameState {
  puzzle: Puzzle
  cells: CellState[][]
  cursor: Position
  startedAt: number
  completedAt: number | null
}

export type Direction = "up" | "down" | "left" | "right"

