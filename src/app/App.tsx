import { useEffect, useMemo, useState } from "react"
import { useKeyboard, useRenderer, useTerminalDimensions } from "@opentui/react"
import { Board } from "../components/Board"
import { CompletionModal } from "../components/CompletionModal"
import { StatusBar } from "../components/StatusBar"
import { createGameState, moveCursor, updateCell } from "../game/state"
import { countFilled, solutionFilledCount } from "../game/validation"
import type { Direction, GameState } from "../game/types"
import { puzzles } from "../puzzles"
import { mono } from "../theme"

function formatElapsed(milliseconds: number): string {
  const seconds = Math.max(0, Math.floor(milliseconds / 1000))
  const minutes = Math.floor(seconds / 60)
  return `${String(minutes).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`
}

export function App({ initialPuzzleIndex = 1 }: { initialPuzzleIndex?: number }) {
  const renderer = useRenderer()
  const dimensions = useTerminalDimensions()
  const [puzzleIndex, setPuzzleIndex] = useState(Math.min(initialPuzzleIndex, puzzles.length - 1))
  const [game, setGame] = useState<GameState>(() => createGameState(puzzles[puzzleIndex]!))
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])

  const restart = () => setGame(createGameState(puzzles[puzzleIndex]!))
  const nextPuzzle = () => {
    const next = (puzzleIndex + 1) % puzzles.length
    setPuzzleIndex(next)
    setGame(createGameState(puzzles[next]!))
  }

  useKeyboard((key) => {
    const movement: Partial<Record<string, Direction>> = {
      up: "up", k: "up", down: "down", j: "down", left: "left", h: "left", right: "right", l: "right",
    }
    if (key.name === "q" || key.name === "escape") return renderer.destroy()
    if (key.name === "r") return restart()
    if (key.name === "n") return nextPuzzle()
    const direction = movement[key.name]
    if (direction) {
      setGame((current) => ({ ...current, cursor: moveCursor(current.cursor, direction, current.puzzle) }))
      return
    }
    if (key.name === "space") setGame((current) => updateCell(current, "fill"))
    else if (key.name === "x") setGame((current) => updateCell(current, "mark"))
    else if (key.name === "backspace" || key.name === "delete" || key.name === "c") {
      setGame((current) => updateCell(current, "clear"))
    }
  })

  const target = useMemo(() => solutionFilledCount(game.puzzle), [game.puzzle])
  const elapsed = formatElapsed((game.completedAt ?? now) - game.startedAt)
  const maxColumnDepth = Math.max(...game.puzzle.columnClues.map((clue) => clue.length))
  const roomyHeight = maxColumnDepth + game.puzzle.height * 2 + 9
  const compact = dimensions.height < roomyHeight
  const narrow = dimensions.width < 96

  return (
    <box
      width="100%"
      height="100%"
      position="relative"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      backgroundColor={mono.background}
    >
      <box flexDirection="column" alignItems="center" gap={1}>
        <box flexDirection="column" alignItems="center">
          <text fg={mono.accent}><strong>NONOGRAM</strong></text>
          <text fg={mono.clueCompleted}>{game.puzzle.name}  ·  {game.puzzle.width}×{game.puzzle.height}</text>
        </box>
        <Board puzzle={game.puzzle} cells={game.cells} cursor={game.cursor} compact={compact} theme={mono} />
        <StatusBar
          filled={countFilled(game.cells)}
          target={target}
          elapsed={elapsed}
          theme={mono}
          narrow={narrow}
        />
      </box>
      {game.completedAt !== null && (
        <box
          position="absolute"
          zIndex={20}
          top={Math.max(1, Math.floor((dimensions.height - 7) / 2))}
          left={Math.max(0, Math.floor((dimensions.width - 40) / 2))}
        >
          <CompletionModal puzzleName={game.puzzle.name} elapsed={elapsed} theme={mono} />
        </box>
      )}
    </box>
  )
}

