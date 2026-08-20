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
        {narrow ? "←↑↓→/hjkl move · Space fill · x mark · c clear · r reset · n next · q quit" : "← ↑ ↓ → / h j k l  move   Space  fill   x  mark   Backspace  clear   r  restart   n  next   q  quit"}
      </text>
    </box>
  )
}
