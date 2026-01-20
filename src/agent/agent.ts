import OpenAI from "openai";
import { Post } from "./types.js";
import { buildSystemPrompt, buildUserPrompt } from "./prompts.js";
import { embeddedTopics } from "./sources.js";
import { getGroundingFromGCB } from "../swarm/router.js";

function pickTopic(): string {
  const i = Math.floor(Math.random() * embeddedTopics.length);
  return embeddedTopics[i];
}

function buildGroundedAddendum(grounding: {
  references: string[];
  facts: string[];
  doctrineCard?: string;
  tags: string[];
  cautions: string[];
}): string {
  const lines: string[] = [];
  if (grounding.facts.length) {
    lines.push("Grounded notes (no verse quotes):");
    for (const f of grounding.facts.slice(0, 6)) lines.push(`- ${f}`);
    lines.push("");
  }
  if (grounding.references.length) {
    lines.push(`Scripture references to use (references only): ${grounding.references.slice(0, 4).join("; ")}`);
    lines.push("");
  }
  if (grounding.doctrineCard) {
    lines.push("Doctrine card (stable wording):");
    lines.push(grounding.doctrineCard);
    lines.push("");
  }
  if (grounding.tags.length) {
    lines.push(`Tags: ${grounding.tags.slice(0, 8).join(", ")}`);
    lines.push("");
  }
  if (grounding.cautions.length) {
    lines.push("Cautions:");
    for (const c of grounding.cautions.slice(0, 6)) lines.push(`- ${c}`);
    lines.push("");
  }
  return lines.join("\n").trim();
}

function fallbackPost(topic: string, refs: string[]): string {
  const refLine = refs.length ? refs.join("; ") : "Genesis 1; Deuteronomy 6:4–9";
  return [
    `Back to Center. Back to God.`,
    ``,
    `Today’s focus: ${topic}`,
    `Small habits build strong faith in little hearts.`,
    `Keep it simple. Keep it consistent.`,
    ``,
    `Scripture (reference): ${refLine}`,
    `Action: Do one 5-minute family worship moment tonight.`,
    ``,
    `#SydTekScholars #Homeschool #FamilyDiscipleship #BibleLearning #HebrewRoots`
  ].join("\n");
}

export async function generatePost(): Promise<Post> {
  const topic = pickTopic();
  const grounding = await getGroundingFromGCB(topic);

  const useLLM = Boolean((process.env.OPENAI_API_KEY ?? "").trim());
  const refs = grounding?.references ?? [];

  if (!useLLM) {
    return { text: fallbackPost(topic, refs) };
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

  const addendum = grounding ? buildGroundedAddendum(grounding) : "";
  const userPrompt = addendum
    ? `${buildUserPrompt(topic)}\n\nUse the grounded addendum below to avoid guessing:\n\n${addendum}`
    : buildUserPrompt(topic);

  const completion = await client.chat.completions.create({
    model,
    messages: [
      { role: "system", content: buildSystemPrompt() },
      { role: "user", content: userPrompt }
    ],
    temperature: 0.7
  });

  const text = completion.choices[0]?.message?.content?.trim() || fallbackPost(topic, refs);
  return { text };
}