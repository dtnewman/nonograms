import type { Theme } from "../theme"

export function TutorialModal({ theme }: { theme: Theme }) {
  return (
    <box
      width={56}
      height={19}
      border
      borderStyle="double"
      borderColor={theme.accent}
      backgroundColor={theme.panel}
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      title=" HOW TO PLAY "
      titleAlignment="center"
      titleColor={theme.accent}
    >
      <text fg={theme.clueCompleted}>Each number describes one consecutive filled run.</text>
      <text><span fg={theme.clue}>A clue of 2 1 means  </span><span fg={theme.cellFilled}>■ ■</span><span fg={theme.cellMarked}> · </span><span fg={theme.cellFilled}>■</span></text>
      <text fg={theme.clueCompleted}>Separate multiple runs with at least one empty square.</text>
      <text fg={theme.clue}>          1  3  5  3  1</text>
      <text fg={theme.grid}>        ┌───────────────┐</text>
      <text><span fg={theme.clue}>  1     </span><span fg={theme.grid}>│</span><span fg={theme.cellMarked}> ·  · </span><span fg={theme.cellFilled}> ■ </span><span fg={theme.cellMarked}> ·  · </span><span fg={theme.grid}>│</span></text>
      <text><span fg={theme.clue}>  3     </span><span fg={theme.grid}>│</span><span fg={theme.cellMarked}> · </span><span fg={theme.cellFilled}> ■  ■  ■ </span><span fg={theme.cellMarked}> · </span><span fg={theme.grid}>│</span></text>
      <text><span fg={theme.clue}>  5     </span><span fg={theme.grid}>│</span><span fg={theme.cellFilled}> ■  ■  ■  ■  ■ </span><span fg={theme.grid}>│</span></text>
      <text><span fg={theme.clue}>  3     </span><span fg={theme.grid}>│</span><span fg={theme.cellMarked}> · </span><span fg={theme.cellFilled}> ■  ■  ■ </span><span fg={theme.cellMarked}> · </span><span fg={theme.grid}>│</span></text>
      <text><span fg={theme.clue}>  1     </span><span fg={theme.grid}>│</span><span fg={theme.cellMarked}> ·  · </span><span fg={theme.cellFilled}> ■ </span><span fg={theme.cellMarked}> ·  · </span><span fg={theme.grid}>│</span></text>
      <text fg={theme.grid}>        └───────────────┘</text>
      <text fg={theme.foreground}>Space fill  ·  arrows / hjkl move</text>
      <text fg={theme.foreground}>Left click fill  ·  right click X  ·  c clear</text>
      <text fg={theme.clueCompleted}>Arrows / hjkl move  ·  r restart</text>
      <text fg={theme.accent}>Enter, t, q, or Esc to close</text>
    </box>
  )
}
