import type { PuzzleDocument } from "./puzzles"

interface OpenRouterResponse {
  choices?: Array<{ message?: { content?: string } }>
  error?: { message?: string }
}

interface OpenRouterModelsResponse {
  data?: Array<{
    id?: string
    name?: string
    architecture?: { input_modalities?: string[]; output_modalities?: string[] }
  }>
}

export interface OpenRouterModelOption {
  id: string
  name: string
}

export async function listImageInputModels(signal?: AbortSignal): Promise<OpenRouterModelOption[]> {
  const response = await fetch("https://openrouter.ai/api/v1/models?input_modalities=image&sort=most-popular", { signal })
  if (!response.ok) throw new Error(`Could not load OpenRouter models (${response.status})`)
  const body = await response.json() as OpenRouterModelsResponse
  return (body.data ?? [])
    .filter((item): item is typeof item & { id: string } => Boolean(
      item.id
      && item.architecture?.input_modalities?.includes("image")
      && item.architecture.output_modalities?.includes("text"),
    ))
    .map((item) => ({ id: item.id, name: item.name || item.id }))
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
  currentDraft?: PuzzleDocument
  currentDraftImage?: string
  signal?: AbortSignal
  onProgress?: (message: string) => void
}): Promise<PuzzleDocument> {
  options.onProgress?.(`Sending ${options.currentDraft ? "revision" : `${options.size}×${options.size} request`} to ${options.model}…`)
  const revisionText = options.currentDraft
    ? `Revise the current nonogram according to this request: ${options.prompt}\n\nCurrent name: ${options.currentDraft.name}\nCurrent pixel grid (# is filled, . is empty):\n${options.currentDraft.rows.join("\n")}\n\nReturn the complete revised puzzle, not a patch.`
    : options.prompt
  const userContent = options.currentDraftImage
    ? [
        { type: "text", text: `${revisionText}\n\nThe attached PNG is an exact rendering of the current pixel grid. Inspect it before revising.` },
        { type: "image_url", image_url: { url: options.currentDraftImage } },
      ]
    : revisionText
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    signal: options.signal,
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
          content: `Create a recognizable ${options.size}x${options.size} nonogram pixel-art solution for the subject the user requests.

Design rules:
- First identify the subject's 2-4 most distinctive visual parts, then preserve each part in the silhouette.
- Keep the whole subject inside the canvas with a one-cell blank border where the grid size permits.
- Aim for roughly 20-45% filled cells. Never turn the subject into one large rectangular or triangular mass.
- Preserve thin structures such as legs, stems, antennae, masts, and handles as one- or two-cell-wide lines.
- Keep meaningfully separate parts separated by negative space; connect only parts that connect on the real object.
- Prefer clean contours and readable proportions over filling the available canvas.
- Avoid visual noise, isolated pixels, letters, shading, and excessive detail.
- Mentally render the # cells as a black silhouette. If it looks like a blob or a different object, revise it before answering.
- When revising a supplied draft, preserve the parts the user did not ask to change and make the requested differences clearly visible.

Return only a JSON object with this exact shape: {"version":1,"id":"lowercase-kebab-case","name":"Short Name","rows":["..##..", "..."]}. The rows array must contain exactly ${options.size} strings, and every string must contain exactly ${options.size} characters using only . and #. Do not include Markdown or commentary.`,
        },
        { role: "user", content: userContent },
      ],
    }),
  })
  options.onProgress?.("Response received; reading puzzle data…")
  const body = await response.json() as OpenRouterResponse
  if (!response.ok) throw new Error(body.error?.message ?? `OpenRouter request failed (${response.status})`)
  const content = body.choices?.[0]?.message?.content
  if (!content) throw new Error("OpenRouter returned no puzzle")
  options.onProgress?.("Puzzle data received; validating the grid…")
  return extractJson(content) as PuzzleDocument
}
