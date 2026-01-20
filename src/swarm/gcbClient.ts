import { HandoffRequest, HandoffResponse } from "./protocol.js";
import { swarmConfig } from "./config.js";

export async function callGCB(req: HandoffRequest): Promise<HandoffResponse> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (swarmConfig.gcb.apiKey) headers["Authorization"] = `Bearer ${swarmConfig.gcb.apiKey}`;

  const res = await fetch(swarmConfig.gcb.endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify(req)
  });

  const text = await res.text();
  if (!res.ok) {
    return {
      schema_version: "response_v1",
      request_id: req.request_id,
      ok: false,
      error: { message: `GCB call failed: ${res.status} ${res.statusText} :: ${text}` }
    };
  }

  try {
    const json = JSON.parse(text) as HandoffResponse;
    return json;
  } catch {
    return {
      schema_version: "response_v1",
      request_id: req.request_id,
      ok: false,
      error: { message: `GCB returned non-JSON: ${text.slice(0, 200)}...` }
    };
  }
}