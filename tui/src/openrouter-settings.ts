import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { appDataDirectory } from "./game/persistence"

interface OpenRouterSettingsFile {
  version: 1
  model: string
  apiKey: string
  imageInput?: boolean
}

export interface OpenRouterSettings {
  model: string
  apiKey: string
  imageInput: boolean
}

export function openRouterSettingsPath(): string {
  return join(appDataDirectory(), "ai-settings.json")
}

export function loadOpenRouterSettings(): Partial<OpenRouterSettings> {
  try {
    const path = openRouterSettingsPath()
    if (!existsSync(path)) return {}
    const data = JSON.parse(readFileSync(path, "utf8")) as Partial<OpenRouterSettingsFile>
    if (data.version !== 1) return {}
    return {
      ...(typeof data.model === "string" ? { model: data.model } : {}),
      ...(typeof data.apiKey === "string" ? { apiKey: data.apiKey } : {}),
      ...(typeof data.imageInput === "boolean" ? { imageInput: data.imageInput } : {}),
    }
  } catch {
    return {}
  }
}

export function saveOpenRouterSettings(settings: OpenRouterSettings): void {
  try {
    const path = openRouterSettingsPath()
    mkdirSync(dirname(path), { recursive: true, mode: 0o700 })
    const temporaryPath = `${path}.tmp`
    const data: OpenRouterSettingsFile = { version: 1, ...settings }
    writeFileSync(temporaryPath, JSON.stringify(data), { mode: 0o600 })
    renameSync(temporaryPath, path)
  } catch {
    // Creator settings are convenient but should never prevent the game from running.
  }
}
