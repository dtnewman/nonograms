import { describe, expect, test } from "bun:test"
import { createGameState, moveCursor, transitionCell, updateCell } from "../src/game/state"
import { isPuzzleSolved } from "../src/game/validation"
import { deriveClues } from "../src/game/clues"
import type { Puzzle } from "../src/game/types"

const solution = [[true, false, true], [false, true, false]]
const puzzle: Puzzle = { id: "test", name: "Test", width: 3, height: 2, solution, ...deriveClues(solution) }

describe("game state", () => {
  test("cell transitions toggle fill and mark independently", () => {
    expect(transitionCell("unknown", "fill")).toBe("filled")
    expect(transitionCell("filled", "fill")).toBe("unknown")
    expect(transitionCell("marked", "fill")).toBe("filled")
    expect(transitionCell("unknown", "mark")).toBe("marked")
    expect(transitionCell("marked", "mark")).toBe("unknown")
    expect(transitionCell("filled", "clear")).toBe("unknown")
  })

  test("cursor stays within rectangular puzzle bounds", () => {
    expect(moveCursor({ row: 0, col: 0 }, "up", puzzle)).toEqual({ row: 0, col: 0 })
    expect(moveCursor({ row: 1, col: 2 }, "right", puzzle)).toEqual({ row: 1, col: 2 })
  })

  test("detects exact solutions and records completion", () => {
    const cells = [["filled", "marked", "filled"], ["marked", "filled", "marked"]] as const
    expect(isPuzzleSolved(puzzle, cells)).toBe(true)

    let state = createGameState(puzzle, 100)
    state = updateCell(state, "fill", 101)
    state = { ...state, cursor: { row: 0, col: 2 } }
    state = updateCell(state, "fill", 102)
    state = { ...state, cursor: { row: 1, col: 1 } }
    state = updateCell(state, "fill", 500)
    expect(state.completedAt).toBe(500)
  })

  test("rejects wrong filled cells and malformed boards", () => {
    expect(isPuzzleSolved(puzzle, [["filled"]])).toBe(false)
    expect(isPuzzleSolved(puzzle, [["filled", "filled", "filled"], ["marked", "filled", "marked"]])).toBe(false)
  })
})

