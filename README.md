# Nonograms

> A crisp, keyboard-first terminal app for solving [nonograms](https://en.wikipedia.org/wiki/Nonogram).

## Quick start

With [Bun](https://bun.sh/) 1.2 or newer installed, run:

```bash
bunx nonograms
```

Choose a puzzle from the home screen.

![Nonograms running in the terminal](docs/demo.gif)

## Development

```bash
bun install
bun run dev       # start with file watching
bun test          # pure game-logic tests
bun run typecheck
```

The game model under `src/game` has no rendering dependencies. Puzzle solutions live in `src/puzzles`, and their clues are derived automatically. UI colors are centralized in `src/theme`, ready for additional palettes.

Puzzle progress is saved automatically in the operating system's app-data location under a `nonograms` folder (`~/Library/Application Support/nonograms` on macOS, `%LOCALAPPDATA%\nonograms` on Windows, or `$XDG_STATE_HOME/nonograms` on Linux).

## Build

Create a standalone executable for the current platform:

```bash
bun run build
./dist/nonogram
```

The GitHub Actions workflow verifies types, tests, and compilation. Platform release binaries and a Homebrew tap can be layered on without changing the application entry point.
