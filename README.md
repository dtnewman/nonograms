# Nonogram

> A crisp, keyboard-first Picross game built for the terminal with TypeScript, React, and OpenTUI.

<!-- Screenshot coming soon: docs/screenshot.png -->

Solve hand-made picture puzzles in a focused interface with responsive layouts, satisfied-clue feedback, an unmistakable cursor, and just enough color to stay out of your way.

## Quick start

Requires [Bun](https://bun.sh/) 1.2 or newer.

```bash
npx nonogram
```

Until the package is published, run the repository directly:

```bash
bun install
bun start
```

Choose a built-in size with `bun start --size=5`, `--size=10`, or `--size=15`. The default is 10×10.

## Controls

| Key | Action |
| --- | --- |
| Arrow keys or `h` `j` `k` `l` | Move cursor |
| `Space` | Toggle filled |
| `x` | Toggle definitely empty |
| `Backspace`, `Delete`, or `c` | Clear cell |
| `r` | Restart puzzle |
| `n` | Next puzzle |
| `q` or `Esc` | Quit |

## Development

```bash
bun install
bun run dev       # start with file watching
bun test          # pure game-logic tests
bun run typecheck
```

The game model under `src/game` has no rendering dependencies. Puzzle solutions live in `src/puzzles`, and their clues are derived automatically. UI colors are centralized in `src/theme`, ready for additional palettes.

## Build

Create a standalone executable for the current platform:

```bash
bun run build
./dist/nonogram
```

The GitHub Actions workflow verifies types, tests, and compilation. Platform release binaries and a Homebrew tap can be layered on without changing the application entry point.

