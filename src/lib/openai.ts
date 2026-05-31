import OpenAI from "openai";
import type { Provider } from "./types.js";
import { parseMessages } from "./parse.js";

export class OpenAIProvider implements Provider {
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model?: string) {
    this.apiKey = apiKey;
    this.model = model ?? "gpt-4o-mini";
  }

  async generateMessages(prompt: string): Promise<string[]> {
    const client = new OpenAI({ apiKey: this.apiKey });

    const completion = await client.chat.completions.create({
      model: this.model,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
    });

    const raw = completion.choices[0]?.message?.content?.trim() ?? "";
    return parseMessages(raw);
  }
}