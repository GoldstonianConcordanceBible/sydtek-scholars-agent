import { TwitterApi } from "twitter-api-v2";
import { Publisher } from "./types.js";
import { Post } from "../agent/types.js";

export class XPublisher implements Publisher {
  private client: TwitterApi;

  constructor() {
    const appKey = process.env.X_APP_KEY ?? "";
    const appSecret = process.env.X_APP_SECRET ?? "";
    const accessToken = process.env.X_ACCESS_TOKEN ?? "";
    const accessSecret = process.env.X_ACCESS_SECRET ?? "";

    if (!appKey || !appSecret || !accessToken || !accessSecret) {
      throw new Error("X credentials missing. Fill X_* in .env.");
    }

    this.client = new TwitterApi({
      appKey,
      appSecret,
      accessToken,
      accessSecret
    });
  }

  async publish(post: Post): Promise<void> {
    // X currently supports up to 280 chars in standard posts.
    const text = post.text.length > 280 ? post.text.slice(0, 277) + "…" : post.text;
    await this.client.v2.tweet(text);
  }
}