import * as vscode from "vscode";
import type { Provider } from "./types.js";
import { GroqProvider } from "./groq.js";
import { OpenAIProvider } from "./openai.js";

interface ExtensionConfig {
  provider: string;
  model: string;
  count: number;
}

export function getExtensionConfig(): ExtensionConfig {
  const config = vscode.workspace.getConfiguration("commitAi");

  return {
    provider: config.get<string>("provider") ?? "groq",
    model: config.get<string>("model") ?? "",
    count: config.get<number>("count") ?? 3,
  };
}

export function getProvider(): Provider {
  const config = vscode.workspace.getConfiguration("commitAi");
  const { provider, model } = getExtensionConfig();

  switch (provider) {
    case "groq": {
      const apiKey = config.get<string>("groqApiKey") ?? "";
      if (!apiKey) {
        throw new Error(
          'Missing Groq API key. Add it under Settings → Extensions → Commit AI → "Groq Api Key".'
        );
      }
      return new GroqProvider(apiKey, model || undefined);
    }
    case "openai": {
      const apiKey = config.get<string>("openAiApiKey") ?? "";
      if (!apiKey) {
        throw new Error(
          'Missing OpenAI API key. Add it under Settings → Extensions → Commit AI → "Open Ai Api Key".'
        );
      }
      return new OpenAIProvider(apiKey, model || undefined);
    }
    default:
      throw new Error(
        `Unknown provider "${provider}". Valid options are: groq, openai.`
      );
  }
}