export const swarmConfig = {
  // Your GCB agent should expose an HTTP endpoint that accepts a handoff request.
  // Example: http://localhost:3333/handoff
  gcb: {
    enabled: (process.env.SWARM_GCB_ENABLED ?? "false").toLowerCase() === "true",
    endpoint: (process.env.SWARM_GCB_ENDPOINT ?? "http://localhost:3333/handoff").trim(),
    apiKey: (process.env.SWARM_GCB_API_KEY ?? "").trim()
  },

  // Behavior switches
  policy: {
    // If GCB is down, still post using local fallback
    allowFallback: (process.env.SWARM_ALLOW_FALLBACK ?? "true").toLowerCase() === "true",
    // When true, the final post should include a reference line only (no verse quotes)
    enforceReferenceOnly: true
  }
};