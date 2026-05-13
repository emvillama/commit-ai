import Groq from "groq-sdk";
import { buildCommitPrompt } from "./prompt.js";

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

export async function generateCommitMessages(diff: string): Promise<string[]>{
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

  const text =
    completion.choices[0]?.message?.content?.trim() ?? "";

  try{
    const messages = JSON.parse(text);

    if(!Array.isArray(messages)){
      throw new Error("Model response was not an array.");
    }

    return messages;
  } 
  catch{
    throw new Error(`Could not parse model response: ${text}`);
  }
}