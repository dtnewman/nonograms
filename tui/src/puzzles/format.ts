import { deriveClues } from "../game/clues"
import type { Puzzle } from "../game/types"

export interface PuzzleDocument {
  version: 1
  id: string
  name: string
  author?: string
  rows: string[]
}

export function parsePuzzleDocument(value: unknown): Puzzle {
  if (!value || typeof value !== "object") throw new Error("Puzzle must be a JSON object")
  const source = value as Partial<PuzzleDocument>
  if (source.version !== 1) throw new Error("Unsupported puzzle version")
  if (typeof source.id !== "string" || !/^[a-z0-9][a-z0-9-]{1,63}$/.test(source.id)) {
    throw new Error("Puzzle id must contain 2-64 lowercase letters, numbers, or hyphens")
  }
  if (typeof source.name !== "string" || source.name.trim().length < 1 || source.name.length > 60) {
    throw new Error("Puzzle name must contain 1-60 characters")
  }
  if (!Array.isArray(source.rows) || source.rows.length < 5 || source.rows.length > 25) {
    throw new Error("Puzzle height must be between 5 and 25")
  }
  const width = source.rows[0]?.length ?? 0
  if (width < 5 || width > 25 || source.rows.some((row) => typeof row !== "string" || row.length !== width || !/^[.#]+$/.test(row))) {
    throw new Error("Rows must be equal-width strings of 5-25 '.' and '#' characters")
  }
  const solution = source.rows.map((row) => [...row].map((cell) => cell === "#"))
  if (!solution.some((row) => row.some(Boolean))) throw new Error("Puzzle must contain at least one filled cell")
  return { id: source.id, name: source.name.trim(), width, height: solution.length, solution, ...deriveClues(solution) }
}

export function puzzleDocument(name: string, solution: boolean[][], author?: string): PuzzleDocument {
  const idBase = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "custom"
  return {
    version: 1,
    id: `${idBase}-${solution[0]?.length ?? 0}x${solution.length}`,
    name: name.trim() || "Untitled",
    ...(author?.trim() ? { author: author.trim() } : {}),
    rows: solution.map((row) => row.map((cell) => cell ? "#" : ".").join("")),
  }
}
