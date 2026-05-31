# commit-ai

Generate conventional commit messages from staged git changes using AI.

`commit-ai` analyzes your staged `git diff`, sends it to an AI model, and suggests clean, specific commit messages you can use immediately — either from your terminal or directly inside VS Code.

The goal is to make writing high-quality commit messages faster, easier, and more consistent.

---

## Features

- Generate commit messages from staged changes
- Conventional commit formatting
- Interactive commit selection with re-roll
- One-click copy, commit, or set as SCM input (extension)
- Generation history (extension)
- Multi-provider support: Groq and OpenAI
- Works as a CLI tool or a VS Code extension — independently

---

## Demo

<!-- Add demo GIF here before publishing to marketplace -->

**VS Code Extension**

Open the command palette and run `Commit AI: Generate Commit Messages`. A panel opens beside your editor with generated suggestions. Click to commit, copy to clipboard, or set as your SCM input message.

**CLI**

Stage your changes and run:

```bash
git add .
npm run dev
```

Select one of the generated messages:

```txt
Choose a commit message:
❯ feat(cli): add --commit flag to skip confirmation prompt
  refactor(ai): move provider init inside generateCommitMessages
  chore: update tsconfig paths for src/lib layout
```

Or commit immediately:

```bash
npm run dev -- --commit
```

---

## How It Works

**Extension flow:**
```
git add .
↓
Command Palette → "Commit AI: Generate Commit Messages"
↓
Commit AI panel opens
↓
AI analyzes staged diff
↓
3 suggestions displayed
↓
Set as SCM message, commit directly, or copy to clipboard
```

**CLI flow:**
```
git add .
↓
commit-ai reads staged diff
↓
AI analyzes changes
↓
Interactive selection in terminal
↓
Optional automatic git commit
```

---

## Requirements

**VS Code Extension**
- VS Code 1.90+
- A Groq API key (free at https://console.groq.com) or OpenAI API key

**CLI**
- Node.js 20+
- npm
- Git
- A Groq API key or OpenAI API key

---

## Installation

**VS Code Extension**

> `.vsix` packaging coming soon. Install instructions will be added here.

**CLI**

Clone the repository:

```bash
git clone https://github.com/emvillama/commit-ai.git
cd commit-ai
npm install
```

Create a `.env` file in the project root:

```env
GROQ_API_KEY=your_api_key_here
```

Or copy the example:

```bash
cp .env.example .env
```

---

## Configuration

**VS Code Extension**

Configure via Settings → Extensions → Commit AI:

| Setting | Default | Description |
|---|---|---|
| `commitAi.provider` | `groq` | AI provider (`groq` or `openai`) |
| `commitAi.groqApiKey` | — | Your Groq API key |
| `commitAi.openAiApiKey` | — | Your OpenAI API key |
| `commitAi.model` | — | Override the default model (leave blank for provider default) |
| `commitAi.count` | `3` | Number of suggestions to generate |

**CLI**

Configuration is read from environment variables or a `~/.commit-ai.json` file:

```json
{
  "provider": "groq",
  "model": "llama-3.3-70b-versatile",
  "count": 3
}
```

Environment variables take precedence: `GROQ_API_KEY`, `OPENAI_API_KEY`, `AI_PROVIDER`, `GROQ_MODEL`, `OPENAI_MODEL`.

---

## Project Structure

```
commit-ai/
├── src/
│   ├── cli/              # CLI entry point and environment wiring
│   │   ├── ai.ts         # Provider setup from env vars
│   │   ├── config.ts     # CLI config (env + ~/.commit-ai.json)
│   │   ├── git.ts        # Git operations (diff, commit)
│   │   └── index.ts      # CLI entry point
│   ├── lib/              # Shared core logic (used by both CLI and extension)
│   │   ├── extensionConfig.ts  # Provider setup from VS Code settings
│   │   ├── groq.ts             # Groq provider
│   │   ├── openai.ts           # OpenAI provider
│   │   ├── parse.ts            # AI response parsing
│   │   ├── prompt.ts           # Prompt construction
│   │   └── types.ts            # Shared interfaces
│   ├── tests/
│   │   ├── parse.test.ts
│   │   └── prompt.test.ts
│   ├── webview/
│   │   ├── CommitAIPanel.ts    # Webview panel controller
│   │   └── panel.html          # Webview UI
│   └── extension.ts      # VS Code extension entry point
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
```

---

## Architecture

### CLI and Extension as Separate Features

`commit-ai` supports two independent interfaces: a CLI tool and a VS Code extension. This is intentional.

The CLI was built first as a standalone tool and remains fully functional on its own — no VS Code required. The extension was added later as a richer interface for developers who want deeper editor integration.

The two are kept deliberately separate so that:

- The CLI works in any terminal environment, CI pipelines, or editors without extension support
- The extension can evolve its UI independently without affecting CLI behavior
- Either can be used, maintained, or removed without breaking the other

### Shared Core (`src/lib/`)

Both interfaces share the same underlying logic. AI provider clients, prompt construction, and response parsing all live in `src/lib/`. The CLI (`src/cli/`) and the extension (`src/extension.ts`, `src/lib/extensionConfig.ts`) are thin wrappers that wire up configuration from their respective environments — environment variables for the CLI, VS Code settings for the extension — and call into the shared core.

### Design Philosophy

**Staged changes only** — `commit-ai` only analyzes staged changes because commits should represent intentional snapshots. This avoids noisy or incomplete messages.

**Conventional commits** — Generated messages follow conventional commit formatting because it improves readability, standardizes history, supports changelog automation, and works well with CI/CD tooling.

**Specific over generic** — The prompt is engineered to produce messages that reference actual function names, modules, and behaviors. Vague messages like `fix: error handling` are explicitly penalized in the prompt.

---

## Roadmap

### Extension

- [x] Extension scaffold with command palette integration
- [x] Webview panel UI
- [x] Generate, copy, commit, and set SCM message actions
- [x] Re-roll suggestions
- [x] Generation history
- [ ] Package as `.vsix`
- [ ] Publish to VS Code Marketplace

### CLI

- [x] Read staged git diff
- [x] Generate commit messages with AI
- [x] Interactive commit selection
- [x] Optional automatic commit execution
- [x] Multi-provider support (Groq, OpenAI)
- [ ] Loading spinner
- [ ] Dry-run mode
- [ ] npm package publishing

### Both

- [ ] GitHub Actions CI
- [ ] Linting and formatting
- [ ] Integration tests

---

## License

MIT