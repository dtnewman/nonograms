# Nonograms

> A crisp, keyboard-first terminal app for solving [nonograms](https://en.wikipedia.org/wiki/Nonogram), with a small web service for sharing community puzzles.

The repository contains two applications:

- [`cli/`](cli) — the terminal game, puzzle creator, and community catalog client
- [`server/`](server) — the Next.js puzzle directory and moderation service

## Quick start

With [Bun](https://bun.sh/) 1.2 or newer installed, run the CLI from npm:

```bash
bunx nonograms
```

![Nonograms running in the terminal](cli/docs/demo.gif)

## CLI development

```bash
cd cli
bun install
bun run dev       # start with file watching
bun test          # pure game-logic tests
bun run typecheck
```

The game model under `cli/src/game` has no rendering dependencies. Puzzle solutions live in `cli/src/puzzles`, and their clues are derived automatically. UI colors are centralized in `cli/src/theme`, ready for additional palettes.

Puzzle progress is saved automatically in the operating system's app-data location under a `nonograms` folder (`~/Library/Application Support/nonograms` on macOS, `%LOCALAPPDATA%\nonograms` on Windows, or `$XDG_STATE_HOME/nonograms` on Linux).

## Create and contribute puzzles

Choose **Create a puzzle** on the home screen to draw a 5×5, 10×10, or 15×15 puzzle. Saved puzzles use the same versioned JSON format as the built-in and community catalog and live in the app-data folder under `puzzles/`.

The creator can ask an image-capable model available through [OpenRouter](https://openrouter.ai/docs/quickstart) to produce and iteratively revise an editable draft. Its model picker is populated from OpenRouter's current catalog; an **Other (text-only)** option accepts any model slug and sends revisions as an exact text grid instead of a PNG. Set `OPENROUTER_API_KEY` before starting the game, or enter a key in the creator. The selected model and API key are stored locally in plaintext in the app-data folder's `ai-settings.json` file (with owner-only file permissions where supported); the key is sent only to OpenRouter.

Press `p` in the creator to submit the current puzzle to the community server for review. The server returns an eight-character, case-insensitive code. After approval, press `g` on the home screen to load that puzzle directly by code.

Press `u` on the home screen to download and validate the current community catalog. The last valid catalog is cached locally, so downloaded puzzles remain available offline and a failed update cannot replace it. Set `NONOGRAMS_SERVER_URL` to override the default `https://nonograms.exe.xyz` server during development.

## Build the CLI

Create a standalone executable for the current platform:

```bash
cd cli
bun run build
./dist/nonogram
```

The GitHub Actions workflow verifies types, tests, and compilation. Platform release binaries and a Homebrew tap can be layered on without changing the application entry point.

## Run the server

```bash
cd server
cp .env.example .env.local
bun install
bun run dev
```

Set `ADMIN_PASSWORD` and a long random `SESSION_SECRET`, then visit `/admin`. See the [server documentation](server/README.md) for production and API details.

## License

[MIT](LICENSE)
