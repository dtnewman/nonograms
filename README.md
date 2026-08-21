# Nonograms

> A crisp, keyboard-first terminal app for solving [nonograms](https://en.wikipedia.org/wiki/Nonogram).

## Quick start

With [Bun](https://bun.sh/) 1.2 or newer installed, run:

```bash
bunx nonograms
```

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

## Create and contribute puzzles

Choose **Create a puzzle** on the home screen to draw a 5×5, 10×10, or 15×15 puzzle. Saved puzzles use the same versioned JSON format as the built-in and community catalog and live in the app-data folder under `puzzles/`.

The creator can ask any model available through [OpenRouter](https://openrouter.ai/docs/quickstart) to produce an editable draft. Set `OPENROUTER_API_KEY` before starting the game, or enter a key temporarily in the creator. Keys are sent only to OpenRouter and are never saved by Nonograms. The default `openrouter/auto` model can be replaced with any OpenRouter model slug.

Community puzzle submissions belong in [dtnewman/nonograms-puzzles](https://github.com/dtnewman/nonograms-puzzles). Exported local JSON files can be added there through a pull request; automated checks validate every grid before review.

Press `u` on the home screen to download and validate the current community catalog. The last valid catalog is cached locally, so downloaded puzzles remain available offline and a failed update cannot replace them.

## Build

Create a standalone executable for the current platform:

```bash
bun run build
./dist/nonogram
```

The GitHub Actions workflow verifies types, tests, and compilation. Platform release binaries and a Homebrew tap can be layered on without changing the application entry point.
