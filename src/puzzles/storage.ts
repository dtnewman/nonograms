import { existsSync, mkdirSync, readdirSync, readFileSync, renameSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { appDataDirectory } from "../game/persistence"
import type { Puzzle } from "../game/types"
import { parsePuzzleDocument, type PuzzleDocument } from "./format"

export function customPuzzleDirectory(): string {
  return join(appDataDirectory(), "puzzles")
}

export function loadCustomPuzzles(): Puzzle[] {
  const directory = customPuzzleDirectory()
  if (!existsSync(directory)) return []
  const puzzles: Puzzle[] = []
  for (const filename of readdirSync(directory).filter((name) => name.endsWith(".json")).sort()) {
    try {
      puzzles.push(parsePuzzleDocument(JSON.parse(readFileSync(join(directory, filename), "utf8"))))
    } catch {
      // Ignore malformed local files; imported community content is never trusted blindly.
    }
  }
  return puzzles
}

const communityCatalogPath = () => join(appDataDirectory(), "community-puzzles.json")

export function loadCommunityPuzzles(): Puzzle[] {
  try {
    const data = JSON.parse(readFileSync(communityCatalogPath(), "utf8")) as { version?: number; puzzles?: unknown[] }
    if (data.version !== 1 || !Array.isArray(data.puzzles)) return []
    return data.puzzles.map(parsePuzzleDocument)
  } catch {
    return []
  }
}

export async function updateCommunityPuzzles(): Promise<Puzzle[]> {
  const response = await fetch("https://raw.githubusercontent.com/dtnewman/nonograms-puzzles/main/index.json")
  if (!response.ok) throw new Error(`Community catalog request failed (${response.status})`)
  const data = await response.json() as { version?: number; puzzles?: unknown[] }
  if (data.version !== 1 || !Array.isArray(data.puzzles)) throw new Error("Community catalog has an unsupported format")
  const puzzles = data.puzzles.map(parsePuzzleDocument)
  const ids = new Set<string>()
  for (const puzzle of puzzles) {
    if (ids.has(puzzle.id)) throw new Error(`Community catalog contains duplicate id: ${puzzle.id}`)
    ids.add(puzzle.id)
  }
  const path = communityCatalogPath()
  mkdirSync(appDataDirectory(), { recursive: true })
  const temporaryPath = `${path}.tmp`
  writeFileSync(temporaryPath, `${JSON.stringify(data, null, 2)}\n`)
  renameSync(temporaryPath, path)
  return puzzles
}

export function saveCustomPuzzle(document: PuzzleDocument): { puzzle: Puzzle; path: string } {
  const puzzle = parsePuzzleDocument(document)
  const directory = customPuzzleDirectory()
  mkdirSync(directory, { recursive: true })
  const path = join(directory, `${puzzle.id}.json`)
  writeFileSync(path, `${JSON.stringify(document, null, 2)}\n`, { flag: "wx" })
  return { puzzle, path }
}
