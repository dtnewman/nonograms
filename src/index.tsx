#!/usr/bin/env bun
import { createCliRenderer } from "@opentui/core"
import { createRoot } from "@opentui/react"
import { App } from "./app/App"
import { mono } from "./theme"

const renderer = await createCliRenderer({
  backgroundColor: mono.background,
  exitOnCtrlC: true,
  clearOnShutdown: true,
  useMouse: true,
})

createRoot(renderer).render(<App />)
