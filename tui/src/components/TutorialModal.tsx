import type { Theme } from "../theme"

interface TutorialModalProps {
  theme: Theme
  page: number
}

export const tutorialPageCount = 3

export function TutorialModal({ theme, page }: TutorialModalProps) {
  return (
    <box width={56} height={19} border borderStyle="double" borderColor={theme.accent}
      backgroundColor={theme.panel} flexDirection="column" alignItems="center" justifyContent="center"
      title=" HOW TO PLAY " titleAlignment="center" titleColor={theme.accent}>
      {page === 0 && (
        <box flexDirection="column" alignItems="center">
          <text fg={theme.accent}><strong>REVEAL THE PICTURE</strong></text>
          <text fg={theme.foreground}>Fill the correct squares in every row and column.</text>
          <text fg={theme.foreground}>The finished grid reveals a hidden picture.</text>
          <text> </text>
          <text fg={theme.clueCompleted}>Numbers beside the grid are clues.</text>
          <text fg={theme.clueCompleted}>Each number is one unbroken run of filled squares.</text>
          <text> </text>
          <text><span fg={theme.clue}>A clue of 3 means  </span><span fg={theme.cellFilled}>■ ■ ■</span></text>
          <text><span fg={theme.clue}>A clue of 1 2 means  </span><span fg={theme.cellFilled}>■</span><span fg={theme.cellMarked}> · </span><span fg={theme.cellFilled}>■ ■</span></text>
          <text fg={theme.clueCompleted}>Multiple runs need an empty square between them.</text>
        </box>
      )}
      {page === 1 && (
        <box flexDirection="column" alignItems="center">
          <text fg={theme.accent}><strong>READ BOTH DIRECTIONS</strong></text>
          <text fg={theme.foreground}>Rows read left to right. Columns read top to bottom.</text>
          <text fg={theme.clue}>          1  3  5  3  1</text>
          <text fg={theme.grid}>        ┌───────────────┐</text>
          <text><span fg={theme.clue}>  1     </span><span fg={theme.grid}>│</span><span fg={theme.cellMarked}> ·  · </span><span fg={theme.cellFilled}> ■ </span><span fg={theme.cellMarked}> ·  · </span><span fg={theme.grid}>│</span></text>
          <text><span fg={theme.clue}>  3     </span><span fg={theme.grid}>│</span><span fg={theme.cellMarked}> · </span><span fg={theme.cellFilled}> ■  ■  ■ </span><span fg={theme.cellMarked}> · </span><span fg={theme.grid}>│</span></text>
          <text><span fg={theme.clue}>  5     </span><span fg={theme.grid}>│</span><span fg={theme.cellFilled}> ■  ■  ■  ■  ■ </span><span fg={theme.grid}>│</span></text>
          <text><span fg={theme.clue}>  3     </span><span fg={theme.grid}>│</span><span fg={theme.cellMarked}> · </span><span fg={theme.cellFilled}> ■  ■  ■ </span><span fg={theme.cellMarked}> · </span><span fg={theme.grid}>│</span></text>
          <text><span fg={theme.clue}>  1     </span><span fg={theme.grid}>│</span><span fg={theme.cellMarked}> ·  · </span><span fg={theme.cellFilled}> ■ </span><span fg={theme.cellMarked}> ·  · </span><span fg={theme.grid}>│</span></text>
          <text fg={theme.grid}>        └───────────────┘</text>
        </box>
      )}
      {page === 2 && (
        <box flexDirection="column" alignItems="center">
          <text fg={theme.accent}><strong>SOLVE WITH CERTAINTY</strong></text>
          <text fg={theme.foreground}>Start with clues that have few possible positions.</text>
          <text fg={theme.foreground}>Mark squares that cannot be filled with an ×.</text>
          <text fg={theme.foreground}>Completed clues dim automatically.</text>
          <text> </text>
          <text fg={theme.clueCompleted}>Arrows or h j k l  move</text>
          <text fg={theme.clueCompleted}>Space / left click  fill</text>
          <text fg={theme.clueCompleted}>x / right click  mark empty</text>
          <text fg={theme.clueCompleted}>c / Backspace / Delete  clear</text>
          <text fg={theme.clueCompleted}>r  restart  ·  n  next puzzle</text>
          <text fg={theme.foreground}>Finish when every filled square is correct.</text>
        </box>
      )}
      <text> </text>
      <text fg={theme.accent}>← → pages  ·  Enter next  ·  t, q, or Esc close</text>
      <text fg={theme.clueCompleted}>{page + 1} / {tutorialPageCount}</text>
    </box>
  )
}
