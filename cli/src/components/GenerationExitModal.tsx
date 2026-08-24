import type { Theme } from "../theme"

export function GenerationExitModal({ generating, theme, selected }: { generating: boolean; theme: Theme; selected: "yes" | "no" }) {
  return (
    <box
      width={54}
      height={7}
      border
      borderStyle="double"
      borderColor={theme.accent}
      backgroundColor={theme.panel}
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      title={generating ? " LEAVE WHILE GENERATING? " : " LEAVE PUZZLE CREATOR? "}
      titleAlignment="center"
      titleColor={theme.accent}
    >
      <text fg={theme.foreground}>{generating ? "This will cancel the OpenRouter request." : "Any unsaved puzzle progress will be lost."}</text>
      <text>
        <span fg={selected === "yes" ? theme.background : theme.foreground} bg={selected === "yes" ? theme.cursor : theme.panel}>  Yes, leave  </span>
        <span fg={theme.clueCompleted}>   </span>
        <span fg={selected === "no" ? theme.background : theme.foreground} bg={selected === "no" ? theme.cursor : theme.panel}>{generating ? "  Keep waiting  " : "  Keep editing  "}</span>
      </text>
      <text fg={theme.clueCompleted}>← → choose · Enter confirm · q/Esc cancel</text>
    </box>
  )
}
