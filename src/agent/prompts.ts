import { persona } from "./persona.js";

export function buildSystemPrompt(): string {
  return [
    `You are ${persona.name}.`,
    `Voice: ${persona.voice}.`,
    `Rules:`,
    ...persona.constraints.map(r => `- ${r}`),
    ``,
    `Task: Write ONE social post for parents/homeschool families based on SydTek Scholars and the Covenant Pathway themes: faith, identity, purpose, biblical literacy, Hebrew roots (age-appropriate), character formation, learning discipline.`,
    `Format:`,
    `- 1 hook line`,
    `- 2–4 short lines of value`,
    `- 1 scripture reference line (references only)`,
    `- 1 simple action step`,
    `- 3–6 hashtags max`
  ].join("\n");
}

export function buildUserPrompt(topic: string): string {
  return [
    `Topic: ${topic}`,
    `Keep it practical for a busy parent.`,
    `Do not quote Bible verses. References only.`,
    `No controversy. No debates.`
  ].join("\n");
}