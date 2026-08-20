import { useEffect, useMemo, useState } from "react"
import { useKeyboard, useRenderer, useTerminalDimensions } from "@opentui/react"
import { Board } from "../components/Board"
import { CompletionModal } from "../components/CompletionModal"
import { HomeScreen } from "../components/HomeScreen"
import { QuitModal } from "../components/QuitModal"
import { StatusBar } from "../components/StatusBar"
import { TutorialModal, tutorialPageCount } from "../components/TutorialModal"
import { createGameState, moveCursor, updateCell } from "../game/state"
import { loadSavedGames, saveGames } from "../game/persistence"
import { countFilled, solutionFilledCount } from "../game/validation"
import type { Direction, GameState } from "../game/types"
import { puzzles } from "../puzzles"
import { mono } from "../theme"

function formatElapsed(milliseconds: number): string {
  const seconds = Math.max(0, Math.floor(milliseconds / 1000))
  const minutes = Math.floor(seconds / 60)
  return `${String(minutes).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`
}

function isSpaceKey(key: { name: string; sequence: string; code?: string }): boolean {
  return key.name === "space" || key.sequence === " " || key.code === "Space"
}

export function App() {
  const renderer = useRenderer()
  const dimensions = useTerminalDimensions()
  const [puzzleIndex, setPuzzleIndex] = useState(0)
  const [savedGames, setSavedGames] = useState<Record<string, GameState>>(() => loadSavedGames(puzzles))
  const [game, setGame] = useState<GameState>(() => savedGames[puzzles[puzzleIndex]!.id] ?? createGameState(puzzles[puzzleIndex]!))
  const [now, setNow] = useState(Date.now())
  const [screen, setScreen] = useState<"home" | "game">("home")
  const [homeSelection, setHomeSelection] = useState(0)
  const [quitConfirmation, setQuitConfirmation] = useState(false)
  const [restartConfirmation, setRestartConfirmation] = useState(false)
  const [quitChoice, setQuitChoice] = useState<"yes" | "no">("yes")
  const [tutorialOpen, setTutorialOpen] = useState(false)
  const [tutorialPage, setTutorialPage] = useState(0)

  const openTutorial = () => {
    setTutorialPage(0)
    setTutorialOpen(true)
  }

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    setSavedGames((current) => ({ ...current, [game.puzzle.id]: game }))
  }, [game])

  useEffect(() => {
    saveGames(savedGames)
  }, [savedGames])

  const restart = () => setGame(createGameState(puzzles[puzzleIndex]!))
  const openPuzzle = (index = puzzleIndex) => {
    setPuzzleIndex(index)
    const puzzle = puzzles[index]!
    setGame(savedGames[puzzle.id] ?? createGameState(puzzle))
    setScreen("game")
  }
  const nextPuzzle = () => {
    const next = (puzzleIndex + 1) % puzzles.length
    const puzzle = puzzles[next]!
    setPuzzleIndex(next)
    setGame(savedGames[puzzle.id] ?? createGameState(puzzle))
  }

  useKeyboard((key) => {
    if (tutorialOpen) {
      if (["t", "q", "escape"].includes(key.name)) {
        setTutorialOpen(false)
      } else if (key.name === "left" || key.name === "h") {
        setTutorialPage((current) => Math.max(0, current - 1))
      } else if (key.name === "right" || key.name === "l") {
        setTutorialPage((current) => Math.min(tutorialPageCount - 1, current + 1))
      } else if (key.name === "return" || key.name === "enter") {
        if (tutorialPage === tutorialPageCount - 1) setTutorialOpen(false)
        else setTutorialPage((current) => current + 1)
      }
      return
    }

    if (quitConfirmation) {
      if (key.name === "y" || ((key.name === "return" || key.name === "enter") && quitChoice === "yes")) {
        saveGames({ ...savedGames, [game.puzzle.id]: game })
        renderer.destroy()
      }
      else if (key.name === "n" || key.name === "q" || key.name === "escape"
        || ((key.name === "return" || key.name === "enter") && quitChoice === "no")) {
        setQuitConfirmation(false)
      } else if (["left", "right", "up", "down", "h", "j", "k", "l", "tab"].includes(key.name)) {
        setQuitChoice((current) => current === "yes" ? "no" : "yes")
      }
      return
    }

    if (restartConfirmation) {
      if (key.name === "y" || ((key.name === "return" || key.name === "enter") && quitChoice === "yes")) {
        restart()
        setRestartConfirmation(false)
      } else if (key.name === "n" || key.name === "q" || key.name === "escape"
        || ((key.name === "return" || key.name === "enter") && quitChoice === "no")) {
        setRestartConfirmation(false)
      } else if (["left", "right", "up", "down", "h", "j", "k", "l", "tab"].includes(key.name)) {
        setQuitChoice((current) => current === "yes" ? "no" : "yes")
      }
      return
    }

    if (screen === "home") {
      if (key.name === "t") {
        openTutorial()
      } else if (key.name === "q" || key.name === "escape") {
        setQuitChoice("yes")
        setQuitConfirmation(true)
      } else if (key.name === "up" || key.name === "k") {
        setHomeSelection((current) => (current - 1 + puzzles.length + 1) % (puzzles.length + 1))
      } else if (key.name === "down" || key.name === "j") {
        setHomeSelection((current) => (current + 1) % (puzzles.length + 1))
      } else if (key.name === "return" || key.name === "enter" || key.name === "space") {
        if (homeSelection === 0) openTutorial()
        else openPuzzle(homeSelection - 1)
      }
      return
    }

    const movement: Partial<Record<string, Direction>> = {
      up: "up", k: "up", down: "down", j: "down", left: "left", h: "left", right: "right", l: "right",
    }
    if (key.name === "t") {
      openTutorial()
      return
    }
    if (key.name === "q" || key.name === "escape") {
      setScreen("home")
      setHomeSelection(puzzleIndex + 1)
      return
    }
    if (key.name === "r") {
      setQuitChoice("no")
      setRestartConfirmation(true)
      return
    }
    if (key.name === "n") return nextPuzzle()
    const direction = movement[key.name]
    if (direction) {
      setGame((current) => ({ ...current, cursor: moveCursor(current.cursor, direction, current.puzzle) }))
      return
    }
    if (isSpaceKey(key)) {
      if (!key.repeated) setGame((current) => updateCell(current, "fill"))
    } else if (key.name === "x") {
      setGame((current) => updateCell(current, "mark"))
    }
    else if (key.name === "backspace" || key.name === "delete" || key.name === "c") {
      setGame((current) => updateCell(current, "clear"))
    }
  })

  const target = useMemo(() => solutionFilledCount(game.puzzle), [game.puzzle])
  const elapsed = formatElapsed((game.completedAt ?? now) - game.startedAt)
  const maxColumnDepth = Math.max(...game.puzzle.columnClues.map((clue) => clue.length))
  const rowClueWidth = Math.max(...game.puzzle.rowClues.map((clue) => clue.join(" ").length)) + 2
  const roomyHeight = maxColumnDepth + game.puzzle.height * 2 + 10
  const compactHeight = maxColumnDepth + game.puzzle.height + Math.floor((game.puzzle.height - 1) / 5) + 12
  const minimumWidth = Math.max(46, rowClueWidth + game.puzzle.width * 3 + 1)
  const compact = dimensions.height < roomyHeight
  const narrow = dimensions.width < 116
  const gameTooSmall = dimensions.width < minimumWidth
    || dimensions.height < compactHeight
    || (compact && dimensions.width < 53)
    || (game.completedAt !== null && dimensions.width < 56)
  const homeTooSmall = dimensions.width < 68 || dimensions.height < puzzles.length + 10
  const tutorialTooSmall = tutorialOpen && (dimensions.width < 60 || dimensions.height < 21)

  const expandWindow = (
    <box
      width="100%"
      height="100%"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      backgroundColor={mono.background}
    >
      <text fg={mono.accent}><strong>EXPAND WINDOW</strong></text>
      <text fg={mono.clueCompleted}>This view needs a little more room.</text>
      <text fg={mono.clueCompleted}>
        {screen === "game" ? "q / Esc  home" : quitConfirmation ? "Enter  quit  ·  q / Esc  cancel" : "q / Esc  quit"}
      </text>
    </box>
  )

  if (screen === "home") {
    if (homeTooSmall || tutorialTooSmall) return expandWindow
    return (
      <box
        width="100%"
        height="100%"
        position="relative"
        alignItems="center"
        justifyContent="center"
        backgroundColor={mono.background}
      >
        <HomeScreen puzzles={puzzles} selected={homeSelection} games={savedGames} theme={mono} />
        {quitConfirmation && (
          <box
            position="absolute"
            zIndex={20}
            top={Math.max(1, Math.floor((dimensions.height - 7) / 2))}
            left={Math.max(0, Math.floor((dimensions.width - 50) / 2))}
          >
            <QuitModal theme={mono} selected={quitChoice} />
          </box>
        )}
        {tutorialOpen && (
          <box
            position="absolute"
            zIndex={30}
            top={Math.max(1, Math.floor((dimensions.height - 19) / 2))}
            left={Math.max(0, Math.floor((dimensions.width - 56) / 2))}
          >
            <TutorialModal theme={mono} page={tutorialPage} />
          </box>
        )}
      </box>
    )
  }

  if (gameTooSmall || tutorialTooSmall) return expandWindow

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
        <box flexDirection="column" alignItems="center" position="relative" left={Math.ceil(rowClueWidth / 2)}>
          <text fg={mono.accent}><strong>NONOGRAM</strong></text>
          <text fg={mono.clueCompleted}>{game.puzzle.name}  ·  {game.puzzle.width}×{game.puzzle.height}</text>
        </box>
        <Board
          puzzle={game.puzzle}
          cells={game.cells}
          cursor={game.cursor}
          compact={compact}
          completed={game.completedAt !== null}
          onCellAction={(row, col, action) => {
            setGame((current) => {
              if (current.completedAt !== null) return current
              const updated = updateCell({ ...current, cursor: { row, col } }, action)
              return { ...updated, cursor: current.cursor }
            })
          }}
          theme={mono}
        />
        {compact && (
          <text fg={mono.accent}>Expand terminal or zoom out for a better experience</text>
        )}
        {game.completedAt !== null ? (
          <CompletionModal puzzleName={game.puzzle.name} elapsed={elapsed} theme={mono} />
        ) : (
          <StatusBar
            filled={countFilled(game.cells)}
            target={target}
            elapsed={elapsed}
            theme={mono}
            narrow={narrow}
          />
        )}
      </box>
      {tutorialOpen && (
        <box
          position="absolute"
          zIndex={30}
          top={Math.max(1, Math.floor((dimensions.height - 19) / 2))}
          left={Math.max(0, Math.floor((dimensions.width - 56) / 2))}
        >
          <TutorialModal theme={mono} page={tutorialPage} />
        </box>
      )}
      {restartConfirmation && (
        <box
          position="absolute"
          zIndex={30}
          top={Math.max(1, Math.floor((dimensions.height - 7) / 2))}
          left={Math.max(0, Math.floor((dimensions.width - 50) / 2))}
        >
          <QuitModal theme={mono} selected={quitChoice} action="restart" />
        </box>
      )}
    </box>
  )
}
