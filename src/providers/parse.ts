export function parseMessages(raw: string): string[] {
  const text = raw.replace(/^```(?:json)?\n?/i, "").replace(/```$/i, "").trim();

  try {
    const parsed: unknown = JSON.parse(text);

    if (
      !Array.isArray(parsed) ||
      !parsed.every((item) => typeof item === "string")
    ) {
      throw new Error("Model response was not an array of strings.");
    }

    return parsed;
  } catch {
    throw new Error(`Could not parse model response: ${raw}`);
  }
}