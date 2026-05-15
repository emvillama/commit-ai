import { buildCommitPrompt } from "./prompt.js";
import { GroqProvider } from "./providers/groq.js";
import { OpenAIProvider } from "./providers/openai.js";
import type { Provider } from "./providers/types.js";

function getProvider(): Provider {
  const name = process.env.AI_PROVIDER?.toLowerCase() ?? "groq";

  switch (name) {
    case "groq":
      return new GroqProvider();
    case "openai":
      return new OpenAIProvider();
    default:
      throw new Error(
        `Unknown provider "${name}". Valid options are: groq, openai.`
      );
  }
}

export async function generateCommitMessages(diff: string): Promise<string[]> {
  const provider = getProvider();
  return provider.generateMessages(buildCommitPrompt(diff));
}