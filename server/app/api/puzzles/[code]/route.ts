import { NextResponse } from "next/server"
import { getPuzzle } from "@/lib/db"

const cors = { "Access-Control-Allow-Origin": "*" }
export async function GET(_request: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  if (!/^[a-z0-9]{8}$/i.test(code)) return NextResponse.json({ error: "Invalid puzzle code" }, { status: 400, headers: cors })
  const record = getPuzzle(code)
  if (!record) return NextResponse.json({ error: "Puzzle not found or awaiting approval" }, { status: 404, headers: cors })
  const { code: canonicalCode, status, createdAt, reviewedAt, ...puzzle } = record
  return NextResponse.json({ ...puzzle, id: canonicalCode.toLowerCase() }, { headers: cors })
}
