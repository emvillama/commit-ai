import { describe, it, expect } from "vitest";
import { parseMessages } from "../providers/parse.js";

describe("parseMessages", () => {
  it("parses a valid JSON array of strings", () => {
    const input = `["feat: add login", "fix: handle null user", "chore: update deps"]`;
    expect(parseMessages(input)).toEqual([
      "feat: add login",
      "fix: handle null user",
      "chore: update deps",
    ]);
  });

  it("strips ```json fences before parsing", () => {
    const input = "```json\n[\"feat: add login\"]\n```";
    expect(parseMessages(input)).toEqual(["feat: add login"]);
  });

  it("strips ``` fences without json tag", () => {
    const input = "```\n[\"feat: add login\"]\n```";
    expect(parseMessages(input)).toEqual(["feat: add login"]);
  });

  it("throws if response is not an array", () => {
    const input = `"feat: add login"`;
    expect(() => parseMessages(input)).toThrow("Could not parse model response");
  });

  it("throws if array contains non-strings", () => {
    const input = `[1, 2, 3]`;
    expect(() => parseMessages(input)).toThrow("Could not parse model response");
  });

  it("throws if response is not valid JSON", () => {
    const input = `this is not json`;
    expect(() => parseMessages(input)).toThrow("Could not parse model response");
  });
});