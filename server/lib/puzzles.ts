import type { PuzzleDocument } from "./types"

export function validatePuzzle(value: unknown): PuzzleDocument {
  if (!value || typeof value !== "object") throw new Error("Puzzle must be a JSON object")
  const source = value as Partial<PuzzleDocument>
  if (source.version !== 1) throw new Error("Unsupported puzzle version")
  if (typeof source.name !== "string" || source.name.trim().length < 1 || source.name.length > 60) {
    throw new Error("Puzzle name must contain 1-60 characters")
  }
  if (source.author !== undefined && (typeof source.author !== "string" || source.author.trim().length > 40)) {
    throw new Error("Author must contain at most 40 characters")
  }
  if (!Array.isArray(source.rows) || source.rows.length < 5 || source.rows.length > 25) {
    throw new Error("Puzzle height must be between 5 and 25")
  }
  const width = source.rows[0]?.length ?? 0
  if (width < 5 || width > 25 || source.rows.some((row) => typeof row !== "string" || row.length !== width || !/^[.#]+$/.test(row))) {
    throw new Error("Rows must be equal-width strings of 5-25 '.' and '#' characters")
  }
  if (!source.rows.some((row) => row.includes("#"))) throw new Error("Puzzle must contain at least one filled cell")
  return {
    version: 1,
    id: "pending",
    name: source.name.trim(),
    ...(source.author?.trim() ? { author: source.author.trim() } : {}),
    rows: source.rows,
  }
}
