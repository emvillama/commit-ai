import { describe, it, expect } from "vitest";
import { buildCommitPrompt } from "../prompt.js";

describe("buildCommitPrompt", () => {
  it("includes the diff in the prompt", () => {
    const diff = "diff --git a/foo.ts b/foo.ts";
    const prompt = buildCommitPrompt(diff);
    expect(prompt).toContain(diff);
  });

  it("instructs the model to return a JSON array", () => {
    const prompt = buildCommitPrompt("any diff");
    expect(prompt).toContain("JSON array");
  });

  it("instructs the model to use conventional commit format", () => {
    const prompt = buildCommitPrompt("any diff");
    expect(prompt).toContain("conventional commit");
  });

  it("instructs the model to generate exactly 3 messages", () => {
    const prompt = buildCommitPrompt("any diff");
    expect(prompt).toContain("exactly 3");
  });
});