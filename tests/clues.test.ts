import { describe, expect, test } from "bun:test"
import { calculateClues, deriveClues } from "../src/game/clues"

describe("calculateClues", () => {
  test("calculates separated runs", () => {
    expect(calculateClues([true, true, false, true, false, true, true, true])).toEqual([2, 1, 3])
  })

  test("represents an entirely blank line as zero", () => {
    expect(calculateClues([false, false, false])).toEqual([0])
  })

  test("handles an entirely full line", () => {
    expect(calculateClues([true, true, true, true])).toEqual([4])
  })

  test("derives rows and columns for a rectangular puzzle", () => {
    const clues = deriveClues([[true, false, true], [true, true, false]])
    expect(clues.rowClues).toEqual([[1, 1], [2]])
    expect(clues.columnClues).toEqual([[2], [1], [1]])
  })
})

