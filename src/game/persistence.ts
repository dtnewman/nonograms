import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { homedir, platform } from "node:os"
import type { CellState, GameState, Puzzle } from "./types"

interface ProgressFile {
  version: 1
  games: Record<string, Omit<GameState, "puzzle">>
}

export function progressFilePath(): string {
  if (platform() === "darwin") return join(homedir(), "Library", "Application Support", "nonograms", "progress.json")
  if (platform() === "win32") {
    return join(process.env.LOCALAPPDATA ?? join(homedir(), "AppData", "Local"), "nonograms", "progress.json")
  }
  return join(process.env.XDG_STATE_HOME ?? join(homedir(), ".local", "state"), "nonograms", "progress.json")
}

function validCells(value: unknown, puzzle: Puzzle): value is CellState[][] {
  return Array.isArray(value)
    && value.length === puzzle.height
    && value.every((row) => Array.isArray(row)
      && row.length === puzzle.width
      && row.every((cell) => cell === "unknown" || cell === "filled" || cell === "marked"))
}

export function loadSavedGames(puzzles: Puzzle[]): Record<string, GameState> {
  try {
    const path = progressFilePath()
    if (!existsSync(path)) return {}
    const data = JSON.parse(readFileSync(path, "utf8")) as Partial<ProgressFile>
    if (data.version !== 1 || !data.games || typeof data.games !== "object") return {}

    const games: Record<string, GameState> = {}
    for (const puzzle of puzzles) {
      const saved = data.games[puzzle.id]
      if (!saved || !validCells(saved.cells, puzzle)) continue
      games[puzzle.id] = {
        puzzle,
        cells: saved.cells,
        cursor: { row: 0, col: 0 },
        startedAt: typeof saved.startedAt === "number" ? saved.startedAt : Date.now(),
        completedAt: typeof saved.completedAt === "number" ? saved.completedAt : null,
      }
    }
    return games
  } catch {
    return {}
  }
}

export function saveGames(games: Record<string, GameState>): void {
  try {
    const path = progressFilePath()
    mkdirSync(dirname(path), { recursive: true })
    const stored = Object.fromEntries(Object.entries(games).map(([id, { puzzle: _puzzle, ...game }]) => [
      id,
      { ...game, cursor: { row: 0, col: 0 } },
    ]))
    const temporaryPath = `${path}.tmp`
    writeFileSync(temporaryPath, JSON.stringify({ version: 1, games: stored } satisfies ProgressFile))
    renameSync(temporaryPath, path)
  } catch {
    // Saving should never prevent the game from running (for example on a read-only home directory).
  }
}
