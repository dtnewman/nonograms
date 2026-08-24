import type { Theme } from "../theme"

interface StatusBarProps {
  filled: number
  target: number
  elapsed: string
  theme: Theme
  narrow: boolean
}

export function StatusBar({ filled, target, elapsed, theme, narrow }: StatusBarProps) {
  return (
    <box flexDirection="column" alignItems="center">
      <text fg={theme.clueCompleted}>Filled <span fg={theme.foreground}>{filled}/{target}</span>  ·  Time <span fg={theme.foreground}>{elapsed}</span></text>
      <text fg={theme.clueCompleted}>
        {narrow ? "Arrows/hjkl move · Space fill · x mark" : "← ↑ ↓ → / h j k l  move   Space  fill   x  mark   Backspace  clear   r  restart   t  tutorial   q/Esc  home"}
      </text>
      {narrow && <text fg={theme.clueCompleted}>c clear · r reset · t tutorial · q/Esc home</text>}
    </box>
  )
}
