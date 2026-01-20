import { Publisher } from "./types.js";
import { Post } from "../agent/types.js";

export class TelegramPublisher implements Publisher {
  private token: string;
  private chatId: string;

  constructor() {
    this.token = (process.env.TELEGRAM_BOT_TOKEN ?? "").trim();
    this.chatId = (process.env.TELEGRAM_CHAT_ID ?? "").trim();
    if (!this.token || !this.chatId) throw new Error("Telegram env missing. Set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID.");
  }

  async publish(post: Post): Promise<void> {
    const url = `https://api.telegram.org/bot${this.token}/sendMessage`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: this.chatId, text: post.text })
    });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Telegram post failed: ${res.status} ${res.statusText} :: ${body}`);
    }
  }
}