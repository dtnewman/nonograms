import type { PuzzleRecord } from "./types"

export async function sendSubmissionEmail(puzzle: PuzzleRecord): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY
  const to = process.env.ADMIN_EMAIL
  const reviewUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/admin/puzzles/${puzzle.code}`
  if (!apiKey || !to) {
    console.info(`Puzzle ${puzzle.code} is awaiting review: ${reviewUrl}`)
    return
  }
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.RESEND_FROM ?? "Nonograms <noreply@foobar.dev>",
      to: [to],
      subject: `Puzzle ${puzzle.code} is ready for review`,
      html: `<p><strong>${escapeHtml(puzzle.name)}</strong> was submitted${puzzle.author ? ` by ${escapeHtml(puzzle.author)}` : ""}.</p><p><a href="${reviewUrl}">View and approve ${puzzle.code}</a></p>`,
    }),
  })
  if (!response.ok) throw new Error(`Resend returned ${response.status}: ${await response.text()}`)
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]!)
}
