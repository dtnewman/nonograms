# Nonograms

Play nonograms in the terminal. Requires [Bun](https://bun.sh/) 1.2+.

```bash
bunx nonograms
```

![Nonograms running in the terminal](cli/docs/demo.gif)

## Puzzles

Puzzles come from [nonograms.exchange](https://nonograms.exchange) and are synced and cached locally at startup, so they work offline. Press `u` to sync manually, `g` to load a puzzle by code.

Choose **Create a puzzle** to draw a 5×5, 10×10, or 15×15 puzzle, or have an [OpenRouter](https://openrouter.ai/docs/quickstart) model draft one (set `OPENROUTER_API_KEY`, or enter a key in the creator — it is stored in plaintext in the app-data folder's `ai-settings.json`). Press `p` to submit a puzzle for review; you get back an eight-character code that works with `g` once approved.

Set `NONOGRAMS_SERVER_URL` to point at a different server.

## Build the CLI

```bash
cd cli
bun run build
./dist/nonogram
```

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
