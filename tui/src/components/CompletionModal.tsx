import type { Theme } from "../theme"

interface CompletionModalProps {
  puzzleName: string
  elapsed: string
  theme: Theme
}

export function CompletionModal({ puzzleName, elapsed, theme }: CompletionModalProps) {
  return (
    <box
      flexDirection="column"
      alignItems="center"
    >
      <text fg={theme.success}>✦  {puzzleName} complete  ·  {elapsed}  ✦</text>
      <text fg={theme.clueCompleted}>r replay  ·  n next  ·  t tutorial  ·  q/Esc home</text>
    </box>
  )
}
