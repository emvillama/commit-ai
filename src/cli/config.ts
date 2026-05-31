import { readFileSync } from "fs";
import { homedir } from "os";
import { join } from "path";

interface Config {
  provider: string;
  model: string;
  count: number;
}

const DEFAULTS: Config = {
  provider: "groq",
  model: "llama-3.3-70b-versatile",
  count: 3,
};

function loadConfigFile(): Partial<Config> {
  try {
    const configPath = join(homedir(), ".commit-ai.json");
    const raw = readFileSync(configPath, "utf-8");
    return JSON.parse(raw) as Partial<Config>;
  } catch {
    return {};
  }
}

export function getConfig(): Config {
  const fileConfig = loadConfigFile();

  return {
    provider: process.env["AI_PROVIDER"] ?? fileConfig.provider ?? DEFAULTS.provider,
    model:
      process.env["GROQ_MODEL"] ??
      process.env["OPENAI_MODEL"] ??
      fileConfig.model ??
      DEFAULTS.model,
    count: fileConfig.count ?? DEFAULTS.count,
  };
}