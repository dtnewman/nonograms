import type { PuzzleDocument } from "./puzzles"

interface OpenRouterResponse {
  choices?: Array<{ message?: { content?: string } }>
  error?: { message?: string }
}

function extractJson(content: string): unknown {
  const fenced = content.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1]
  return JSON.parse((fenced ?? content).trim())
}

export async function generatePuzzle(options: {
  apiKey: string
  model: string
  prompt: string
  size: number
}): Promise<PuzzleDocument> {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${options.apiKey}`,
      "Content-Type": "application/json",
      "X-Title": "Nonograms Puzzle Creator",
    },
    body: JSON.stringify({
      model: options.model,
      temperature: 0.4,
      messages: [
        {
          role: "system",
          content: `Create a clear ${options.size}x${options.size} nonogram pixel-art solution. Return only JSON with version 1, a lowercase kebab-case id, a short name, and exactly ${options.size} rows containing only . and #. Avoid empty outer margins and use connected, recognizable shapes.`,
        },
        { role: "user", content: options.prompt },
      ],
    }),
  })
  const body = await response.json() as OpenRouterResponse
  if (!response.ok) throw new Error(body.error?.message ?? `OpenRouter request failed (${response.status})`)
  const content = body.choices?.[0]?.message?.content
  if (!content) throw new Error("OpenRouter returned no puzzle")
  return extractJson(content) as PuzzleDocument
}
