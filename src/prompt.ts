export function buildCommitPrompt(diff: string): string {
  return `
You are an expert software engineer writing git commit messages.

Analyze the git diff below and generate exactly 3 conventional commit messages.

Rules:
- Use conventional commit format: <type>(<optional scope>): <description>
- Prefer types: feat, fix, refactor, docs, test, chore
- Each message must be specific to what actually changed — reference function names, modules, or behaviors where relevant
- Keep each message under 72 characters
- Return only a JSON array of strings, no markdown, no explanation

Good examples (specific):
- "refactor(ai): move Groq client init inside generateCommitMessages"
- "fix(parser): strip markdown fences before JSON.parse"
- "feat(cli): add --commit flag to skip confirmation prompt"

Bad examples (too vague):
- "feat: ai commit"
- "fix: error handling"
- "refactor: code"

The 3 messages should vary in scope — one can describe the overall change, the others should highlight specific details.

Git diff:
${diff}
`;
}