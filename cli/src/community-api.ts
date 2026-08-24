import { parsePuzzleDocument, type PuzzleDocument } from "./puzzles"
import type { Puzzle } from "./game/types"

const baseUrl = (process.env.NONOGRAMS_SERVER_URL ?? "https://nonograms.exchange").replace(/\/$/, "")

async function errorMessage(response: Response): Promise<string> {
  try {
    const body = await response.json() as { error?: string }
    return body.error ?? `Server returned ${response.status}`
  } catch {
    return `Server returned ${response.status}`
  }
}

export async function submitCommunityPuzzle(document: PuzzleDocument): Promise<{ code: string }> {
  const response = await fetch(`${baseUrl}/api/puzzles`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(document),
  })
  if (!response.ok) throw new Error(await errorMessage(response))
  const result = await response.json() as { code?: unknown }
  if (typeof result.code !== "string" || !/^[a-z0-9]{8}$/i.test(result.code)) throw new Error("Server returned an invalid puzzle code")
  return { code: result.code.toUpperCase() }
}

export async function fetchPuzzleByCode(code: string): Promise<Puzzle> {
  const normalized = code.trim().toUpperCase()
  if (!/^[A-Z0-9]{8}$/.test(normalized)) throw new Error("Enter an 8-character puzzle code")
  const response = await fetch(`${baseUrl}/api/puzzles/${normalized}`)
  if (!response.ok) throw new Error(await errorMessage(response))
  return parsePuzzleDocument(await response.json())
}

export async function fetchCommunityCatalog(): Promise<Puzzle[]> {
  const response = await fetch(`${baseUrl}/api/puzzles`)
  if (!response.ok) throw new Error(await errorMessage(response))
  const data = await response.json() as { version?: number; puzzles?: unknown[] }
  if (data.version !== 1 || !Array.isArray(data.puzzles)) throw new Error("Server returned an unsupported catalog")
  return data.puzzles.map(parsePuzzleDocument)
}
