# Xcode CLI

## Global install

```bash
npm install -g @xtool.ai/xcode
```

This CLI is designed to be installed globally so the `xcode` command is available on your PATH.

Agentic programming CLI for terminal-first workflows. Xcode is a tool-driven assistant that can read, write, edit, and reason over files to help you build software faster.

## Why Xcode

- **Tool-first**: Built to wire up file I/O, editing, and command execution tools.
- **Composable**: Add your own commands and sub-tools as the CLI grows.
- **Terminal-native**: Runs anywhere Node.js runs.

## Install

```bash
npm install -g @xtool.ai/xcode
```

## Quick start

```bash
xcode init
xcode
```

Then ask it to do work in your repo.

## Commands

- `help` - Show CLI usage
- `init` - Initialize a workspace config in the current folder
- `model` - Show or set the active model
- `plan` - Generate a concise plan for a task
- `usage` - Show usage totals for this session

## Interactive session

Run `xcode` without arguments to enter interactive mode.

Slash commands inside the session:

- `/help`
- `/model`
- `/plan <task>`
- `/usage`
- `/exit`

## Models

Available models (OpenRouter):

- `moonshotai/kimi-k2:free`
- `google/gemma-3-12b-it:free`
- `qwen/qwen3-4b:free`
- `meta-llama/llama-3.2-3b-instruct:free`
- `google/gemma-3-4b-it:free`
- `google/gemma-3n-e4b-it:free`
- `google/gemma-3n-e2b-it:free`

Note: many free models do not support tool use on OpenRouter. If you see a tool-use error,
switch to a tools-capable model (for example: `openai/gpt-4o-mini`, `openai/gpt-4.1-mini`,
`anthropic/claude-3.5-sonnet`).

Set the model:

```bash
xcode model set moonshotai/kimi-k2:free
```

Set globally:

```bash
xcode model set moonshotai/kimi-k2:free --global
```

## API key

Xcode uses OpenRouter. Provide an API key via environment variable or `.env`:

```
OPENROUTER_API_KEY=your_key_here
```

## Tools

The agent can call tools during a session:

- `read_file`
- `write_file`
- `edit_file` (find/replace)
- `list_dir`
- `run_command` (asks for confirmation by default)

## Configuration

`xcode init` creates a `.xcode/config.json` in your project. You can also store a global config in `~/.xcode/config.json`.

## Roadmap

- [ ] Patch-based editing tool
- [ ] Multi-step task planner
- [ ] Workspace tool permissions UI
- [ ] Richer tool tracing and logs

## Development

Clone and install dependencies:

```bash
git clone <your-repo-url>
cd XTool.AI/Xcode
npm install
```

Run locally:

```bash
node bin/xcode.js
```

## Contributing

Issues and PRs are welcome. Please open a discussion for major changes before submitting a PR.

## License

MIT
