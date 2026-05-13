export function buildCommitPrompt(diff: string): string {
  return `
You are an expert software engineer.

Generate 3 concise conventional commit messages for this git diff.

Rules:
- Use conventional commit format.
- Prefer types like feat, fix, refactor, docs, test, chore.
- Keep each message under 72 characters.
- Do not include markdown.
- Return only a JSON array of strings.

Git diff:
${diff}
`;
}