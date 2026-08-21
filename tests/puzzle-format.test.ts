import { describe, expect, test } from "bun:test"
import { parsePuzzleDocument, puzzleDocument } from "../src/puzzles"

describe("puzzle JSON format", () => {
  test("derives a playable puzzle from rows", () => {
    const puzzle = parsePuzzleDocument({ version: 1, id: "cross-5", name: "Cross", rows: ["..#..", "..#..", "#####", "..#..", "..#.."] })
    expect(puzzle.width).toBe(5)
    expect(puzzle.rowClues[2]).toEqual([5])
    expect(puzzle.columnClues[2]).toEqual([5])
  })

  test("rejects malformed and empty grids", () => {
    expect(() => parsePuzzleDocument({ version: 1, id: "bad", name: "Bad", rows: [".....", ".....", ".....", ".....", "....."] })).toThrow()
    expect(() => parsePuzzleDocument({ version: 1, id: "bad", name: "Bad", rows: ["#####", "....", ".....", ".....", "....."] })).toThrow()
  })

  test("exports the canonical document format", () => {
    expect(puzzleDocument("Tiny Heart", [
      [false, true, false, true, false],
      [true, true, true, true, true],
      [true, true, true, true, true],
      [false, true, true, true, false],
      [false, false, true, false, false],
    ], "Ada")).toEqual({
      version: 1,
      id: "tiny-heart-5x5",
      name: "Tiny Heart",
      author: "Ada",
      rows: [".#.#.", "#####", "#####", ".###.", "..#.."],
    })
  })
})
