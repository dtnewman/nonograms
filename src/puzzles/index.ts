import { deriveClues } from "../game/clues"
import type { Puzzle } from "../game/types"

interface PuzzleData {
  id: string
  name: string
  rows: string[]
}

const data: PuzzleData[] = [
  {
    id: "spark-5",
    name: "Spark",
    rows: ["..#..", ".###.", "#####", ".###.", "..#.."],
  },
  {
    id: "cup-10",
    name: "Morning Cup",
    rows: [
      "..........", ".######...", ".#....#...", ".#....###.", ".#....#.#.",
      ".#....###.", ".#....#...", "..####....", "...##.....", ".######...",
    ],
  },
  {
    id: "mountain-15",
    name: "Mountain Night",
    rows: [
      "............#..", "..#........###.", ".###......#####", "#####.......#..", "..#............",
      "...............", ".......#.......", "......###......", ".....#####.....", "....#######....",
      "...#########...", "..###########..", ".#############.", "######...######", "###############",
    ],
  },
]

function makePuzzle(source: PuzzleData): Puzzle {
  const width = source.rows[0]?.length ?? 0
  if (width === 0 || source.rows.some((row) => row.length !== width)) {
    throw new Error(`Puzzle ${source.id} has inconsistent row widths`)
  }
  const solution = source.rows.map((row) => [...row].map((cell) => cell === "#"))
  return {
    id: source.id,
    name: source.name,
    width,
    height: solution.length,
    solution,
    ...deriveClues(solution),
  }
}

export const puzzles = data.map(makePuzzle)
export const defaultPuzzle = puzzles.find((puzzle) => puzzle.width === 10) ?? puzzles[0]!

