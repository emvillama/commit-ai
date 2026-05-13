# commit-ai

Generate conventional commit messages from staged git changes using AI.

`commit-ai` is a TypeScript CLI tool that reads your staged `git diff`, sends it to an AI model, and suggests clean commit messages you can use immediately.

The goal is to make writing high-quality commit messages faster, easier, and more consistent.

---

# Features

- Generate commit messages from staged changes
- Conventional commit formatting
- Interactive commit selection
- Optional automatic commit execution
- Built with TypeScript and Node.js
- Simple CLI workflow
- AI-powered suggestions using Groq (for now)

---

# Demo

Stage your changes:

```bash
git add .
```

Run the CLI:

```bash
npm run dev
```

Select one of the generated commit messages.
(Example output):

```txt
Choose a commit message:
❯ feat: add AI-powered commit message generator
  fix: improve staged diff parsing
  chore: configure TypeScript CLI setup
```

or

Generate a message and immediately create the commit:

```bash
npm run dev -- --commit
```

---

# How It Works

```txt
git add .
↓
commit-ai reads staged git diff
↓
AI analyzes changes
↓
commit-ai generates commit messages
↓
you choose one
↓
optional automatic git commit
```

---

# Requirements

- Node.js 20+
- npm
- Git
- Groq API key

---

# Installation

Clone the repository:

```bash
git clone https://github.com/emvillama/commit-ai.git
cd commit-ai
```

Install dependencies:

```bash
npm install
```

---

# Environment Setup

Create a `.env` file in the project root:

```env
GROQ_API_KEY=your_api_key_here
GROQ_MODEL=llama-3.3-70b-versatile
```

Or copy the example file:

```bash
cp .env.example .env
```

---

# Project Structure

```txt
commit-ai/
├── src/
│   ├── ai.ts
│   ├── git.ts
│   ├── index.ts
│   └── prompt.ts
├── tests/
├── docs/
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
```

---

# Architecture Overview

## `index.ts`

CLI entrypoint and user interaction flow.

## `git.ts`

Handles Git operations:
- reading staged diffs
- creating commits

## `ai.ts`

Handles AI provider integration and response parsing.

## `prompt.ts`

Builds prompts used for commit message generation.

---

# Design Philosophy

## Staged Changes Only

`commit-ai` only analyzes staged changes because commits should represent intentional snapshots.

This avoids noisy or incomplete commit messages.

## Conventional Commits

Generated messages follow conventional commit formatting because it:
- improves readability
- standardizes history
- supports changelog automation
- works well with CI/CD tooling

## Simple First

The project prioritizes:
- fast workflow
- minimal setup
- clear output
- extensibility

before adding advanced features.

---

# Roadmap

## v0.1 — MVP

- [x] Read staged git diff
- [x] Generate commit messages with AI
- [x] Interactive commit selection
- [x] Optional automatic commit execution

## v0.2 — CLI Improvements

- [ ] Copy-to-clipboard support
- [ ] Better error handling
- [ ] Loading spinner
- [ ] Dry-run mode

## v0.3 — Configuration

- [ ] Config file support
- [ ] Custom commit styles
- [ ] Custom prompt templates
- [ ] Model configuration

## v0.4 — Quality

- [ ] Unit tests
- [ ] Integration tests
- [ ] GitHub Actions CI
- [ ] Linting and formatting

## v0.5 — Distribution

- [ ] Build pipeline
- [ ] npm package publishing
- [ ] Global installation support
- [ ] Release automation

## v1.0 — Stable Release

- [ ] Stable public CLI API
- [ ] Full documentation
- [ ] Plugin architecture exploration
- [ ] Multi-provider AI support

---

# License

MIT