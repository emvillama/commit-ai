import { getConfig } from "./config.js";
import { buildCommitPrompt } from "./prompt.js";
import { GroqProvider } from "./providers/groq.js";
import { OpenAIProvider } from "./providers/openai.js";
import type { Provider } from "./providers/types.js";

function getProvider(): Provider {
  const { provider } = getConfig();

  switch (provider) {
    case "groq":
      return new GroqProvider();
    case "openai":
      return new OpenAIProvider();
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