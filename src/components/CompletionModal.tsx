import type { Theme } from "../theme"

interface CompletionModalProps {
  puzzleName: string
  elapsed: string
  theme: Theme
}

export function CompletionModal({ puzzleName, elapsed, theme }: CompletionModalProps) {
  return (
    <box
      width={40}
      height={7}
      border
      borderStyle="double"
      borderColor={theme.success}
      backgroundColor={theme.panel}
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      title=" PUZZLE COMPLETE "
      titleAlignment="center"
      titleColor={theme.success}
    >
      <text fg={theme.foreground}>✦  {puzzleName}  ✦</text>
      <text fg={theme.clueCompleted}>Solved in <span fg={theme.success}>{elapsed}</span></text>
      <text fg={theme.clueCompleted}>r replay  ·  n next  ·  q quit</text>
    </box>
  )
}

