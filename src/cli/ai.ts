import { getConfig } from "./config.js";
import { buildCommitPrompt } from "../lib/prompt";
import { GroqProvider } from "../lib/groq";
import { OpenAIProvider } from "../lib/openai";
import type { Provider } from "../lib/types";

function getProvider(): Provider {
  const { provider, model } = getConfig();

  const groqKey = process.env["GROQ_API_KEY"] ?? "";
  const openAiKey = process.env["OPENAI_API_KEY"] ?? "";

  switch (provider) {
    case "groq":
      if (!groqKey) {
        throw new Error(
          "Missing GROQ_API_KEY. Get a free key at https://console.groq.com and add it to your .env file."
        );
      }
      return new GroqProvider(groqKey, model || undefined);
    case "openai":
      if (!openAiKey) {
        throw new Error(
          "Missing OPENAI_API_KEY. Get a key at https://platform.openai.com and add it to your .env file."
        );
      }
      return new OpenAIProvider(openAiKey, model || undefined);
    default:
      throw new Error(
        `Unknown provider "${provider}". Valid options are: groq, openai.`
      );
  }
}

export async function generateCommitMessages(diff: string): Promise<string[]> {
  const provider = getProvider();
  const { count } = getConfig();
  return provider.generateMessages(buildCommitPrompt(diff, count));
}