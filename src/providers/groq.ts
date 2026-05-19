import Groq from "groq-sdk";
import type { Provider } from "./types.js";
import { parseMessages } from "./parse.js";

export class GroqProvider implements Provider {
  async generateMessages(prompt: string): Promise<string[]> {
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      throw new Error(
        "Missing GROQ_API_KEY. Get a free key at https://console.groq.com and add it to your .env file."
      );
    }

    const client = new Groq({ apiKey });

    const completion = await client.chat.completions.create({
      model: process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
    });

    const raw = completion.choices[0]?.message?.content?.trim() ?? "";
    return parseMessages(raw);
  }
}