import type { Theme } from "../theme"

export function QuitModal({
  theme,
  selected,
  action = "quit",
}: {
  theme: Theme
  selected: "yes" | "no"
  action?: "quit" | "restart" | "delete"
}) {
  const restarting = action === "restart"
  const deleting = action === "delete"
  return (
    <box
      width={50}
      height={7}
      border
      borderStyle="double"
      borderColor={theme.accent}
      backgroundColor={theme.panel}
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      title={deleting ? " DELETE LOCAL PUZZLE? " : restarting ? " RESTART PUZZLE? " : " QUIT NONOGRAM? "}
      titleAlignment="center"
      titleColor={theme.accent}
    >
      <text fg={theme.foreground}>
        {deleting ? "Remove this puzzle and its progress?" : restarting ? "Erase this puzzle's progress?" : "Are you sure you want to quit?"}
      </text>
      <text>
        <span
          fg={selected === "yes" ? theme.background : theme.foreground}
          bg={selected === "yes" ? theme.cursor : theme.panel}
        >  Yes  </span>
        <span fg={theme.clueCompleted}>     </span>
        <span
          fg={selected === "no" ? theme.background : theme.foreground}
          bg={selected === "no" ? theme.cursor : theme.panel}
        >  No  </span>
      </text>
      <text fg={theme.clueCompleted}>← → choose  ·  Enter confirm  ·  q/Esc cancel</text>
    </box>
  )
}
