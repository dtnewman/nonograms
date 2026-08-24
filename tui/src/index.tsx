#!/usr/bin/env bun
import { createCliRenderer } from "@opentui/core"
import { createRoot } from "@opentui/react"
import { App } from "./app/App"
import { mono } from "./theme"
import { updateCommunityPuzzles } from "./puzzles/storage"

// Refresh on every launch. updateCommunityPuzzles replaces the cache only after
// a complete, validated response, so an offline launch keeps the last good copy.
try {
  await updateCommunityPuzzles()
} catch {
  // The app remains usable with cached community and local custom puzzles.
}

const renderer = await createCliRenderer({
  backgroundColor: mono.background,
  exitOnCtrlC: true,
  clearOnShutdown: true,
  useMouse: true,
  onDestroy: () => process.exit(0),
})

createRoot(renderer).render(<App />)
