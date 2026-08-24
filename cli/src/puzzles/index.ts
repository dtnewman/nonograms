import builtins from "./builtin.json"
import { parsePuzzleDocument, type PuzzleDocument } from "./format"

export const puzzles = (builtins as PuzzleDocument[]).map(parsePuzzleDocument)
export const defaultPuzzle = puzzles.find((puzzle) => puzzle.width === 10) ?? puzzles[0]!
export { parsePuzzleDocument, puzzleDocument, type PuzzleDocument } from "./format"
