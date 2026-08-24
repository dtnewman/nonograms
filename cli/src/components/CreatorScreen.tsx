import { useEffect, useRef, useState } from "react"
import { useKeyboard, usePaste, useTerminalDimensions } from "@opentui/react"
import { GenerationExitModal } from "./GenerationExitModal"
import type { Puzzle } from "../game/types"
import { gridPngDataUrl } from "../grid-image"
import { generatePuzzle, listImageInputModels, type OpenRouterModelOption } from "../openrouter"
import { loadOpenRouterSettings, saveOpenRouterSettings } from "../openrouter-settings"
import { parsePuzzleDocument, puzzleDocument } from "../puzzles"
import { saveCustomPuzzle } from "../puzzles/storage"
import type { Theme } from "../theme"
import { submitCommunityPuzzle } from "../community-api"

type Focus = "grid" | "name" | "key" | "model" | "modelList" | "customModel" | "settings" | "prompt" | "generate" | "edit"

interface CreatorScreenProps {
  disabled?: boolean
  theme: Theme
  onCancel: () => void
  onSaved: (puzzle: Puzzle) => void
}

const blankGrid = (size: number) => Array.from({ length: size }, () => Array<boolean>(size).fill(false))

export function CreatorScreen({ disabled = false, theme, onCancel, onSaved }: CreatorScreenProps) {
  const dimensions = useTerminalDimensions()
  const [initialAiSettings] = useState(loadOpenRouterSettings)
  const [size, setSize] = useState(10)
  const [grid, setGrid] = useState(() => blankGrid(10))
  const [cursor, setCursor] = useState({ row: 0, col: 0 })
  const [focus, setFocus] = useState<Focus>("grid")
  const [name, setName] = useState("")
  const [apiKey, setApiKey] = useState(initialAiSettings.apiKey ?? process.env.OPENROUTER_API_KEY ?? "")
  const [apiKeySource, setApiKeySource] = useState<"environment" | "local">(!initialAiSettings.apiKey && process.env.OPENROUTER_API_KEY ? "environment" : "local")
  const [model, setModel] = useState(initialAiSettings.model ?? "")
  const [imageInput, setImageInput] = useState(initialAiSettings.imageInput ?? false)
  const [modelPickerOpen, setModelPickerOpen] = useState(false)
  const [imageModels, setImageModels] = useState<OpenRouterModelOption[]>([])
  const [modelCatalogStatus, setModelCatalogStatus] = useState("Loading image-capable models…")
  const [editingAiSettings, setEditingAiSettings] = useState(!initialAiSettings.apiKey || !initialAiSettings.model)
  const [prompt, setPrompt] = useState("")
  const [hasAiDraft, setHasAiDraft] = useState(false)
  const [status, setStatus] = useState("Draw with Space, or ask AI for a starting point.")
  const [generating, setGenerating] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [generationSeconds, setGenerationSeconds] = useState(0)
  const [exitConfirmation, setExitConfirmation] = useState(false)
  const [exitChoice, setExitChoice] = useState<"yes" | "no">("no")
  const generationController = useRef<AbortController | null>(null)

  useEffect(() => {
    if (!generating) return
    const startedAt = Date.now()
    setGenerationSeconds(0)
    const timer = setInterval(() => setGenerationSeconds(Math.floor((Date.now() - startedAt) / 1000)), 1000)
    return () => clearInterval(timer)
  }, [generating])

  useEffect(() => {
    const timer = setTimeout(() => saveOpenRouterSettings({ apiKey, model, imageInput }), 300)
    return () => clearTimeout(timer)
  }, [apiKey, imageInput, model])

  useEffect(() => {
    const controller = new AbortController()
    void listImageInputModels(controller.signal).then((models) => {
      setImageModels(models)
      setModelCatalogStatus(models.length ? `${models.length} image-capable models` : "No image-capable models found")
    }).catch((error) => {
      if (!controller.signal.aborted) setModelCatalogStatus(error instanceof Error ? error.message : "Could not load models")
    })
    return () => controller.abort()
  }, [])

  const resize = (next: number) => {
    if (next === 15 && dimensions.height < 29) {
      setStatus("A 15×15 canvas needs a terminal at least 29 rows tall.")
      return
    }
    setSize(next)
    setGrid(blankGrid(next))
    setHasAiDraft(false)
    setCursor({ row: 0, col: 0 })
    setStatus(`Started a blank ${next}×${next} puzzle.`)
  }

  const save = () => {
    if (!name.trim()) {
      setFocus("name")
      setStatus("Could not save: enter a puzzle name.")
      return
    }
    try {
      const { puzzle, path } = saveCustomPuzzle(puzzleDocument(name.trim(), grid))
      setStatus(`Saved ${path}`)
      onSaved(puzzle)
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not save puzzle")
    }
  }

  const submit = async () => {
    if (!name.trim()) {
      setFocus("name")
      return setStatus("Could not submit: enter a puzzle name.")
    }
    setSubmitting(true)
    setStatus("Submitting for review…")
    try {
      const { code } = await submitCommunityPuzzle(puzzleDocument(name.trim(), grid))
      setStatus(`Submitted · code ${code} · awaiting approval`)
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not submit puzzle")
    } finally {
      setSubmitting(false)
    }
  }

  const askAi = async () => {
    if (!apiKey) return setStatus("Enter an OpenRouter API key or set OPENROUTER_API_KEY.")
    if (!model.trim()) {
      setEditingAiSettings(true)
      setFocus("model")
      return setStatus("Select a model before generating a draft.")
    }
    if (!prompt.trim()) return setStatus(hasAiDraft ? "Describe what should change in the draft." : "Describe the picture you want AI to create.")
    setEditingAiSettings(false)
    setGenerating(true)
    setStatus("Preparing instructions for OpenRouter…")
    const controller = new AbortController()
    generationController.current = controller
    try {
      const currentDraft = hasAiDraft ? puzzleDocument(name, grid) : undefined
      const document = await generatePuzzle({
        apiKey,
        model,
        prompt,
        size,
        currentDraft,
        currentDraftImage: currentDraft && imageInput ? gridPngDataUrl(grid) : undefined,
        signal: controller.signal,
        onProgress: setStatus,
      })
      const generated = parsePuzzleDocument(document)
      if (generated.width !== size || generated.height !== size) throw new Error(`AI returned ${generated.width}×${generated.height}; expected ${size}×${size}`)
      setGrid(generated.solution)
      setHasAiDraft(true)
      setPrompt("")
      setFocus("prompt")
      setStatus(imageInput ? "Draft loaded. Revise it, edit its pixels, or save." : "Draft loaded. This model receives revisions as a text grid.")
    } catch (error) {
      if (!controller.signal.aborted) setStatus(error instanceof Error ? error.message : "AI generation failed")
    } finally {
      if (generationController.current === controller) generationController.current = null
      setExitConfirmation(false)
      setGenerating(false)
    }
  }

  usePaste((event) => {
    if (disabled || focus !== "key") return
    const pasted = new TextDecoder().decode(event.bytes).replace(/[\r\n]/g, "")
    if (!pasted) return
    event.preventDefault()
    event.stopPropagation()
    setApiKeySource("local")
    setApiKey((value) => value + pasted)
  })

  useKeyboard((key) => {
    if (exitConfirmation) {
      if (key.name === "y" || ((key.name === "return" || key.name === "enter") && exitChoice === "yes")) {
        generationController.current?.abort()
        setExitConfirmation(false)
        onCancel()
      } else if (key.name === "n" || key.name === "q" || key.name === "escape"
        || ((key.name === "return" || key.name === "enter") && exitChoice === "no")) {
        setExitConfirmation(false)
      } else if (["left", "right", "up", "down", "h", "j", "k", "l", "tab"].includes(key.name)) {
        setExitChoice((current) => current === "yes" ? "no" : "yes")
      }
      return
    }
    if (disabled) {
      if (key.name === "escape" || key.name === "q") {
        key.preventDefault()
        key.stopPropagation()
        setExitChoice("no")
        setExitConfirmation(true)
      }
      return
    }
    if (generating && (key.name === "escape" || key.name === "q")) {
      key.preventDefault()
      key.stopPropagation()
      setExitChoice("no")
      setExitConfirmation(true)
      return
    }
    if (focus === "modelList") {
      if (key.name === "escape") {
        key.preventDefault()
        key.stopPropagation()
        setModelPickerOpen(false)
        setFocus("model")
      }
      return
    }
    if (key.name === "escape") {
      if (focus !== "grid") return setFocus("grid")
      key.preventDefault()
      key.stopPropagation()
      setExitChoice("no")
      return setExitConfirmation(true)
    }
    if (focus === "key") {
      if (key.name === "up" || key.name === "down") {
        key.preventDefault()
        key.stopPropagation()
        if (key.name === "up") return setFocus(imageInput ? "model" : "customModel")
        if (apiKey && model.trim()) setEditingAiSettings(false)
        return setFocus("prompt")
      }
      if (key.name === "tab" || key.name === "return" || key.name === "enter") {
        if (apiKey && model.trim()) setEditingAiSettings(false)
        return setFocus("prompt")
      }
      if (key.name === "backspace" || key.name === "delete") {
        setApiKeySource("local")
        return setApiKey((value) => value.slice(0, -1))
      }
      if (key.sequence && !key.ctrl && !key.meta && key.sequence >= " ") {
        setApiKeySource("local")
        setApiKey((value) => value + key.sequence)
      }
      return
    }
    if (focus !== "grid") {
      if (focus === "model" && (key.name === "return" || key.name === "enter" || key.name === "space")) {
        setModelPickerOpen(true)
        return setFocus("modelList")
      }
      if (focus === "settings" && (key.name === "return" || key.name === "enter" || key.name === "space")) {
        setEditingAiSettings(true)
        return setFocus("model")
      }
      if (focus === "generate" && (key.name === "return" || key.name === "enter" || key.name === "space")) {
        if (!generating) void askAi()
        return
      }
      if (focus === "edit" && (key.name === "return" || key.name === "enter" || key.name === "space")) {
        setStatus("Editing pixels. Use arrows to move and Space to draw; press a to return to AI.")
        return setFocus("grid")
      }
      if (key.name === "up" || key.name === "down") {
        key.preventDefault()
        key.stopPropagation()
        if (focus === "model" && key.name === "down") setFocus(imageInput ? "key" : "customModel")
        else if (focus === "customModel" && key.name === "up") setFocus("model")
        else if (focus === "customModel" && key.name === "down") setFocus("key")
        else if (focus === "settings" && key.name === "down") setFocus("prompt")
        else if (focus === "prompt" && key.name === "up") setFocus(editingAiSettings ? "key" : "settings")
        else if (focus === "prompt" && key.name === "down") setFocus("generate")
        else if (focus === "generate" && key.name === "up") setFocus("prompt")
        else if (focus === "generate" && key.name === "down" && hasAiDraft) setFocus("edit")
        else if (focus === "edit" && key.name === "up") setFocus("generate")
        return
      }
      if (key.name === "tab") {
        if (focus === "name") setFocus(editingAiSettings ? "model" : "settings")
        else if (focus === "model") setFocus(imageInput ? "key" : "customModel")
        else if (focus === "customModel") setFocus("key")
        else if (focus === "settings") setFocus("prompt")
        else if (focus === "prompt") setFocus("generate")
        else if (focus === "generate" && hasAiDraft) setFocus("edit")
        else setFocus("grid")
      }
      return
    }
    if (key.name === "q") {
      key.preventDefault()
      key.stopPropagation()
      setExitChoice("no")
      return setExitConfirmation(true)
    }
    if (key.name === "n") return setFocus("name")
    if (key.name === "a") return setFocus(editingAiSettings ? "model" : "prompt")
    if (key.name === "s") return save()
    if (key.name === "p" && !submitting) return void submit()
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
    <box width="100%" height="100%" position="relative" alignItems="center" justifyContent="center">
      <box flexDirection="column" alignItems="center" gap={1}>
      <box flexDirection="column" alignItems="center">
        <text fg={theme.accent}><strong>PUZZLE CREATOR</strong></text>
        <text>
          <span fg={size === 5 ? theme.accent : theme.clueCompleted}>{size === 5 ? <strong>1  5×5</strong> : "1  5×5"}</span>
          <span fg={theme.clueCompleted}>   ·   </span>
          <span fg={size === 10 ? theme.accent : theme.clueCompleted}>{size === 10 ? <strong>2  10×10</strong> : "2  10×10"}</span>
          <span fg={theme.clueCompleted}>   ·   </span>
          <span fg={size === 15 ? theme.accent : theme.clueCompleted}>{size === 15 ? <strong>3  15×15</strong> : "3  15×15"}</span>
        </text>
      </box>
      <box border borderColor={focus === "name" ? theme.accent : theme.grid} width={48} height={3} title=" Name (n) ">
        <input value={name} focused={focus === "name"} onInput={setName} onSubmit={() => setFocus("grid")} placeholder="Required before saving" />
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
          {editingAiSettings ? (
            <>
              {modelPickerOpen ? (
                <box border borderColor={theme.accent} height={10} title=" Image-capable model ">
                  <select
                    focused={focus === "modelList"}
                    height={8}
                    options={[
                      ...imageModels.map((item) => ({ name: item.name, description: item.id, value: item.id })),
                      { name: "Other (text-only)", description: "Enter any OpenRouter model slug", value: "__other__" },
                    ]}
                    selectedIndex={imageInput ? Math.max(0, imageModels.findIndex((item) => item.id === model)) : imageModels.length}
                    showDescription
                    showScrollIndicator
                    onSelect={(_index, option) => {
                      if (!option) return
                      setModelPickerOpen(false)
                      if (option.value === "__other__") {
                        setImageInput(false)
                        setFocus("customModel")
                      } else {
                        setModel(String(option.value))
                        setImageInput(true)
                        setFocus("key")
                      }
                    }}
                  />
                </box>
              ) : (
                <box border borderColor={focus === "model" ? theme.accent : theme.grid} height={3} title=" Model ">
                  <text fg={focus === "model" ? theme.accent : model ? theme.foreground : theme.clueCompleted}>
                    {model ? imageInput ? model : "Other (text-only)" : "Select a model"}  ▾
                  </text>
                </box>
              )}
              {!modelPickerOpen && !imageInput && (
                <box border borderColor={focus === "customModel" ? theme.accent : theme.grid} height={3} title=" Model slug ">
                  <input value={model} focused={focus === "customModel"} onInput={setModel} onSubmit={() => setFocus("key")} />
                </box>
              )}
              {!modelPickerOpen && <text fg={theme.clueCompleted}>{modelCatalogStatus}</text>}
              <box border borderColor={focus === "key" ? theme.accent : theme.grid} height={3} title=" API key (or OPENROUTER_API_KEY) ">
                <text fg={apiKey ? theme.foreground : theme.clueCompleted}>
                  {apiKey ? `${"•".repeat(Math.min(apiKey.length, 30))}${focus === "key" ? "▌" : ""}` : focus === "key" ? "Type or paste your key here ▌" : "Type or paste your key here"}
                </text>
              </box>
              <text fg={theme.clueCompleted}>{apiKeySource === "environment" ? "Loaded from OPENROUTER_API_KEY" : "Saved locally; env var also supported"}</text>
            </>
          ) : (
            <text fg={focus === "settings" ? theme.accent : theme.clueCompleted}>
              Model: {model}
            </text>
          )}
          <box border borderColor={focus === "prompt" ? theme.accent : theme.grid} height={3} title={hasAiDraft ? " Revise this draft " : " Describe your puzzle "}>
            <input value={prompt} focused={focus === "prompt"} onInput={setPrompt} onSubmit={() => void askAi()} placeholder={hasAiDraft ? "e.g. narrower body, larger wings" : "e.g. a sailboat"} />
          </box>
          <box border borderColor={focus === "generate" ? theme.accent : theme.grid} height={3} alignItems="center" justifyContent="center">
            <text fg={focus === "generate" ? theme.accent : theme.foreground}><strong>{generating ? "Generating…" : hasAiDraft ? "Revise draft" : "Generate draft"}</strong></text>
          </box>
          {hasAiDraft && (
            <box border borderColor={focus === "edit" ? theme.accent : theme.grid} height={3} alignItems="center" justifyContent="center">
              <text fg={focus === "edit" ? theme.accent : theme.foreground}><strong>Edit pixels</strong></text>
            </box>
          )}
          <text fg={theme.clueCompleted}>↑/↓ fields · Enter select</text>
          <text fg={status.toLowerCase().includes("fail") || status.toLowerCase().includes("could") ? theme.error : theme.clueCompleted}>{generating ? `◌ ${status} (${generationSeconds}s)` : status}</text>
        </box>
      </box>
        <text fg={theme.clueCompleted}>Arrows/hjkl move · Space draw · n name · a AI · s save · p publish · q/Esc home</text>
      </box>
      {exitConfirmation && (
        <box
          position="absolute"
          zIndex={30}
          top={Math.max(0, Math.floor((dimensions.height - 7) / 2))}
          left={Math.max(0, Math.floor((dimensions.width - 54) / 2))}
        >
          <GenerationExitModal generating={generating} theme={theme} selected={exitChoice} />
        </box>
      )}
    </box>
  )
}
