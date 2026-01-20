import { persona } from "../agent/persona.js";
import { swarmConfig } from "./config.js";
import { callGCB } from "./gcbClient.js";
import { HandoffRequest } from "./protocol.js";

function rid(): string {
  return `req_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

export async function getGroundingFromGCB(topic: string): Promise<{
  references: string[];
  facts: string[];
  doctrineCard?: string;
  tags: string[];
  cautions: string[];
} | null> {
  if (!swarmConfig.gcb.enabled) return null;

  const req: HandoffRequest = {
    schema_version: "handoff_v1",
    request_id: rid(),
    timestamp_iso: new Date().toISOString(),
    from_agent: { name: persona.name, repo: "sydtek-scholars-agent" },
    to_agent: { name: "gcb-agent" },
    intent: "post_grounding",
    context: {
      topic,
      audience: "parents",
      grade_band: "K-2",
      constraints: [
        "No copyrighted Bible text. References only.",
        "Kid-safe, family-safe language.",
        "No hostility. No mocking. Gentle tone.",
        "Short, practical action step."
      ]
    },
    ask: { max_items: 6, response_format: "bullets" }
  };

  const resp = await callGCB(req);
  if (!resp.ok || !resp.payload) return null;

  return {
    references: resp.payload.references ?? [],
    facts: resp.payload.facts ?? [],
    doctrineCard: resp.payload.doctrine_card,
    tags: resp.payload.tags ?? [],
    cautions: resp.payload.cautions ?? []
  };
}