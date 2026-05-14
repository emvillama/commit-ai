import Groq from "groq-sdk";
import { buildCommitPrompt } from "./prompt.js";

export async function generateCommitMessages(diff: string): Promise<string[]>{
  const apiKey = process.env.GROQ_API_KEY;

  if (!process.env.GROQ_API_KEY) {
    throw new Error("Missing GROQ_API_KEY. Add it to your .env file.");
  }

  const client = new Groq({ apiKey });

  const completion = await client.chat.completions.create({
    model:
      process.env.GROQ_MODEL ??
      "llama-3.3-70b-versatile",

    messages:[
      {
        role: "user",
        content: buildCommitPrompt(diff)
      }
    ],

    temperature: 0.4
  });
  
  const raw = completion.choices[0]?.message?.content?.trim() ?? "";

  // Strip markdown code fences LLMs sometimes wrap responses in
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
  }
  catch{
    throw new Error(`Could not parse model response: ${text}`);
  }
}