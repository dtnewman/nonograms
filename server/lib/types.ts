export interface PuzzleDocument {
  version: 1
  id: string
  name: string
  author?: string
  rows: string[]
}

export interface PuzzleRecord extends PuzzleDocument {
  code: string
  status: "pending" | "approved" | "rejected"
  createdAt: string
  reviewedAt: string | null
}
