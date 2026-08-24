import { NextResponse } from "next/server"
import { createPuzzle, listPuzzles } from "@/lib/db"
import { sendSubmissionEmail } from "@/lib/email"
import { validatePuzzle } from "@/lib/puzzles"

const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "Content-Type", "Access-Control-Allow-Methods": "GET, POST, OPTIONS" }
export function OPTIONS() { return new Response(null, { status: 204, headers: cors }) }
export function GET() {
  const puzzles = listPuzzles().map(({ code, status, createdAt, reviewedAt, ...puzzle }) => ({ ...puzzle, id: code.toLowerCase() }))
  return NextResponse.json({ version: 1, puzzles }, { headers: cors })
}
export async function POST(request: Request) {
  try {
    const length = Number(request.headers.get("content-length") ?? 0)
    if (length > 64_000) return NextResponse.json({ error: "Request is too large" }, { status: 413, headers: cors })
    const puzzle = createPuzzle(validatePuzzle(await request.json()))
    let notificationSent = true
    try { await sendSubmissionEmail(puzzle) } catch (error) { notificationSent = false; console.error(error) }
    return NextResponse.json({ code: puzzle.code, status: puzzle.status, notificationSent }, { status: 201, headers: cors })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid submission" }, { status: 400, headers: cors })
  }
}
