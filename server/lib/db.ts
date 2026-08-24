import Database from "better-sqlite3"
import { mkdirSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { randomBytes } from "node:crypto"
import type { PuzzleDocument, PuzzleRecord } from "./types"

const databasePath = resolve(process.env.DATABASE_PATH ?? "./data/nonograms.db")
mkdirSync(dirname(databasePath), { recursive: true })
const db = new Database(databasePath)
db.pragma("journal_mode = WAL")
db.pragma("foreign_keys = ON")
db.exec(`
  CREATE TABLE IF NOT EXISTS puzzles (
    code TEXT PRIMARY KEY COLLATE NOCASE,
    name TEXT NOT NULL,
    author TEXT,
    rows_json TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected')),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TEXT
  );
  CREATE INDEX IF NOT EXISTS puzzles_status_created ON puzzles(status, created_at DESC);
`)

type Row = { code: string; name: string; author: string | null; rows_json: string; status: PuzzleRecord["status"]; created_at: string; reviewed_at: string | null }
const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"

function document(row: Row): PuzzleRecord {
  return {
    version: 1,
    id: row.code.toLowerCase(),
    code: row.code,
    name: row.name,
    ...(row.author ? { author: row.author } : {}),
    rows: JSON.parse(row.rows_json) as string[],
    status: row.status,
    createdAt: row.created_at,
    reviewedAt: row.reviewed_at,
  }
}

function newCode(): string {
  const bytes = randomBytes(8)
  return [...bytes].map((byte) => alphabet[byte % alphabet.length]).join("")
}

export function createPuzzle(puzzle: PuzzleDocument): PuzzleRecord {
  const insert = db.prepare("INSERT INTO puzzles (code, name, author, rows_json) VALUES (?, ?, ?, ?)")
  for (let attempt = 0; attempt < 8; attempt++) {
    const code = newCode()
    try {
      insert.run(code, puzzle.name, puzzle.author ?? null, JSON.stringify(puzzle.rows))
      return getPuzzle(code, true)!
    } catch (error) {
      if (!(error instanceof Error) || !error.message.includes("UNIQUE")) throw error
    }
  }
  throw new Error("Could not allocate a puzzle code")
}

export function getPuzzle(code: string, includeUnapproved = false): PuzzleRecord | null {
  const row = db.prepare(`SELECT * FROM puzzles WHERE code = ? ${includeUnapproved ? "" : "AND status = 'approved'"}`).get(code) as Row | undefined
  return row ? document(row) : null
}

export function listPuzzles(status: PuzzleRecord["status"] = "approved"): PuzzleRecord[] {
  return (db.prepare("SELECT * FROM puzzles WHERE status = ? ORDER BY created_at DESC").all(status) as Row[]).map(document)
}

export function reviewPuzzle(code: string, status: "approved" | "rejected"): void {
  db.prepare("UPDATE puzzles SET status = ?, reviewed_at = CURRENT_TIMESTAMP WHERE code = ?").run(status, code)
}
