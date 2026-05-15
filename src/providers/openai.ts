import OpenAI from "openai";
import type { Provider } from "./types.js";
import { parseMessages } from "./parse.js";

export class OpenAIProvider implements Provider {
  async generateMessages(prompt: string): Promise<string[]> {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error(
        "Missing OPENAI_API_KEY. Get a key at https://platform.openai.com and add it to your .env file."
      );
    }

    const client = new OpenAI({ apiKey });

    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
    });

    const raw = completion.choices[0]?.message?.content?.trim() ?? "";
    return parseMessages(raw);
  }
}