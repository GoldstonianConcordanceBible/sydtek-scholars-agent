export type HandoffIntent =
  | "definition"
  | "routing"
  | "doctrine_card"
  | "canon_note"
  | "scripture_references"
  | "tags"
  | "fact_check"
  | "post_grounding";

export type HandoffRequest = {
  schema_version: "handoff_v1";
  request_id: string;
  timestamp_iso: string;

  from_agent: {
    name: string;
    repo: string;
  };

  to_agent: {
    name: "gcb-agent";
  };

  intent: HandoffIntent;

  context: {
    topic: string;
    audience: "parents" | "students" | "teachers" | "general";
    grade_band?: "K-2" | "3-5" | "6-8" | "9-12";
    constraints: string[];
  };

  // what we want back
  ask: {
    max_items?: number;
    response_format?: "bullets" | "json" | "short_paragraph";
  };
};

export type HandoffResponse = {
  schema_version: "response_v1";
  request_id: string;
  ok: boolean;

  payload?: {
    references?: string[];     // e.g., ["Genesis 1", "Deuteronomy 6:4–9"]
    doctrine_card?: string;    // short stable rule card text
    routing?: string[];        // reading routes for deeper study
    tags?: string[];           // controlled vocabulary tags
    cautions?: string[];       // tone/safety constraints
    facts?: string[];          // short grounded claims (no verse quotes)
  };

  error?: {
    message: string;
  };
};