import { Publisher } from "./types.js";
import { Post } from "../agent/types.js";

export class DiscordPublisher implements Publisher {
  private webhookUrl: string;

  constructor() {
    this.webhookUrl = (process.env.DISCORD_WEBHOOK_URL ?? "").trim();
    if (!this.webhookUrl) throw new Error("DISCORD_WEBHOOK_URL missing in .env.");
  }

  async publish(post: Post): Promise<void> {
    const res = await fetch(this.webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: post.text })
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Discord post failed: ${res.status} ${res.statusText} :: ${body}`);
    }
  }
}