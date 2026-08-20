#!/usr/bin/env bun
import { createCliRenderer } from "@opentui/core"
import { createRoot } from "@opentui/react"
import { App } from "./app/App"
import { puzzles } from "./puzzles"
import { mono } from "./theme"

function initialPuzzleIndex(): number {
  const sizeFlag = Bun.argv.find((argument) => argument.startsWith("--size="))?.split("=")[1]
  const size = Number(sizeFlag)
  const index = puzzles.findIndex((puzzle) => puzzle.width === size && puzzle.height === size)
  return index >= 0 ? index : 1
}

const renderer = await createCliRenderer({
  backgroundColor: mono.background,
  exitOnCtrlC: true,
  clearOnShutdown: true,
  useMouse: true,
})

createRoot(renderer).render(<App initialPuzzleIndex={initialPuzzleIndex()} />)
