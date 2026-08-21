import { useState } from "react"
import { useKeyboard, useTerminalDimensions } from "@opentui/react"
import type { Puzzle } from "../game/types"
import { generatePuzzle } from "../openrouter"
import { parsePuzzleDocument, puzzleDocument } from "../puzzles"
import { saveCustomPuzzle } from "../puzzles/storage"
import type { Theme } from "../theme"

type Focus = "grid" | "name" | "key" | "model" | "prompt"

interface CreatorScreenProps {
  theme: Theme
  onCancel: () => void
  onSaved: (puzzle: Puzzle) => void
}

const blankGrid = (size: number) => Array.from({ length: size }, () => Array<boolean>(size).fill(false))

export function CreatorScreen({ theme, onCancel, onSaved }: CreatorScreenProps) {
  const dimensions = useTerminalDimensions()
  const [size, setSize] = useState(10)
  const [grid, setGrid] = useState(() => blankGrid(10))
  const [cursor, setCursor] = useState({ row: 0, col: 0 })
  const [focus, setFocus] = useState<Focus>("grid")
  const [name, setName] = useState("My Puzzle")
  const [apiKey, setApiKey] = useState(process.env.OPENROUTER_API_KEY ?? "")
  const [model, setModel] = useState("openrouter/auto")
  const [prompt, setPrompt] = useState("")
  const [status, setStatus] = useState("Draw with Space, or ask AI for a starting point.")
  const [generating, setGenerating] = useState(false)

  const resize = (next: number) => {
    if (next === 15 && dimensions.height < 29) {
      setStatus("A 15×15 canvas needs a terminal at least 29 rows tall.")
      return
    }
    setSize(next)
    setGrid(blankGrid(next))
    setCursor({ row: 0, col: 0 })
    setStatus(`Started a blank ${next}×${next} puzzle.`)
  }

  const save = () => {
    try {
      const { puzzle, path } = saveCustomPuzzle(puzzleDocument(name, grid))
      setStatus(`Saved ${path}`)
      onSaved(puzzle)
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not save puzzle")
    }
  }

  const askAi = async () => {
    if (!apiKey) return setStatus("Enter an OpenRouter API key or set OPENROUTER_API_KEY.")
    if (!prompt.trim()) return setStatus("Describe the picture you want AI to create.")
    setGenerating(true)
    setStatus("Asking OpenRouter…")
    try {
      const document = await generatePuzzle({ apiKey, model, prompt, size })
      const generated = parsePuzzleDocument(document)
      if (generated.width !== size || generated.height !== size) throw new Error(`AI returned ${generated.width}×${generated.height}; expected ${size}×${size}`)
      setGrid(generated.solution)
      setName(generated.name)
      setFocus("grid")
      setStatus("AI draft loaded. Edit it, then press s to save.")
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "AI generation failed")
    } finally {
      setGenerating(false)
    }
  }

  useKeyboard((key) => {
    if (key.name === "escape") return focus === "grid" ? onCancel() : setFocus("grid")
    if (focus === "key") {
      if (key.name === "tab" || key.name === "return" || key.name === "enter") return setFocus("model")
      if (key.name === "backspace" || key.name === "delete") return setApiKey((value) => value.slice(0, -1))
      if (key.sequence && !key.ctrl && !key.meta && key.sequence >= " ") setApiKey((value) => value + key.sequence)
      return
    }
    if (focus !== "grid") {
      if (key.name === "tab") setFocus(focus === "name" ? "key" : focus === "model" ? "prompt" : "grid")
      return
    }
    if (key.name === "q") return onCancel()
    if (key.name === "n") return setFocus("name")
    if (key.name === "a") return setFocus("key")
    if (key.name === "s") return save()
    if (key.name === "1") return resize(5)
    if (key.name === "2") return resize(10)
    if (key.name === "3") return resize(15)
    const movement: Record<string, [number, number] | undefined> = {
      up: [-1, 0], k: [-1, 0], down: [1, 0], j: [1, 0], left: [0, -1], h: [0, -1], right: [0, 1], l: [0, 1],
    }
    const delta = movement[key.name]
    if (delta) return setCursor(({ row, col }) => ({ row: Math.max(0, Math.min(size - 1, row + delta[0])), col: Math.max(0, Math.min(size - 1, col + delta[1])) }))
    if (key.name === "space" || key.sequence === " ") {
      setGrid((current) => current.map((row, rowIndex) => row.map((cell, colIndex) => rowIndex === cursor.row && colIndex === cursor.col ? !cell : cell)))
    }
  })

  return (
    <box flexDirection="column" alignItems="center" gap={1}>
      <box flexDirection="column" alignItems="center">
        <text fg={theme.accent}><strong>PUZZLE CREATOR</strong></text>
        <text fg={theme.clueCompleted}>1  5×5   ·   2  10×10   ·   3  15×15</text>
      </box>
      <box border borderColor={focus === "name" ? theme.accent : theme.grid} width={48} height={3} title=" Name (n) ">
        <input value={name} focused={focus === "name"} onInput={setName} onSubmit={() => setFocus("grid")} />
      </box>
      <box flexDirection="row" gap={2} alignItems="flex-start">
        <box border borderColor={theme.grid} padding={1} flexDirection="column">
          {grid.map((row, rowIndex) => (
            <text key={rowIndex}>
              {row.map((filled, colIndex) => {
                const selected = focus === "grid" && cursor.row === rowIndex && cursor.col === colIndex
                return <span key={colIndex} fg={selected ? theme.background : filled ? theme.cellFilled : theme.clueCompleted} bg={selected ? theme.cursor : theme.panel}>{filled ? "██" : "··"}</span>
              })}
            </text>
          ))}
        </box>
        <box width={40} flexDirection="column">
          <text fg={theme.accent}><strong>AI ASSISTANT (a)</strong></text>
          <text fg={focus === "key" ? theme.accent : theme.clueCompleted}>API key  {apiKey ? "•".repeat(Math.min(apiKey.length, 24)) : "not set"}</text>
          <box border borderColor={focus === "model" ? theme.accent : theme.grid} height={3} title=" Model ">
            <input value={model} focused={focus === "model"} onInput={setModel} onSubmit={() => setFocus("prompt")} />
          </box>
          <box border borderColor={focus === "prompt" ? theme.accent : theme.grid} height={3} title=" Describe your puzzle ">
            <input value={prompt} focused={focus === "prompt"} onInput={setPrompt} onSubmit={() => void askAi()} placeholder="e.g. a sailboat" />
          </box>
          <text fg={status.toLowerCase().includes("fail") || status.toLowerCase().includes("could") ? theme.error : theme.clueCompleted}>{generating ? "◌ " : ""}{status}</text>
        </box>
      </box>
      <text fg={theme.clueCompleted}>Arrows/hjkl move · Space draw · n name · a AI · s save · q/Esc home</text>
    </box>
  )
}
