import OpenAI from "openai";
import { Post } from "./types.js";
import { buildSystemPrompt, buildUserPrompt } from "./prompts.js";
import { embeddedTopics } from "./sources.js";

function pickTopic(): string {
  const i = Math.floor(Math.random() * embeddedTopics.length);
  return embeddedTopics[i];
}

function fallbackPost(topic: string): string {
  return [
    `Back to Center. Back to God.`,
    ``,
    `Today’s focus: ${topic}`,
    `Small habits build strong faith in little hearts.`,
    `Keep it simple. Keep it consistent.`,
    ``,
    `Scripture (reference): Genesis 1; Deuteronomy 6:4–9`,
    `Action: Do one 5-minute family worship moment tonight.`,
    ``,
    `#SydTekScholars #Homeschool #FamilyDiscipleship #BibleLearning #HebrewRoots`
  ].join("\n");
}

export async function generatePost(): Promise<Post> {
  const topic = pickTopic();
  const useLLM = Boolean((process.env.OPENAI_API_KEY ?? "").trim());

  if (!useLLM) {
    return { text: fallbackPost(topic) };
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

  const completion = await client.chat.completions.create({
    model,
    messages: [
      { role: "system", content: buildSystemPrompt() },
      { role: "user", content: buildUserPrompt(topic) }
    ],
    temperature: 0.7
  });

  const text = completion.choices[0]?.message?.content?.trim() || fallbackPost(topic);
  return { text };
}