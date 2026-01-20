import { Publisher } from "./types.js";
import { Post } from "../agent/types.js";

type LinkedInPayload = {
  author: string;
  lifecycleState: "PUBLISHED";
  specificContent: {
    "com.linkedin.ugc.ShareContent": {
      shareCommentary: { text: string };
      shareMediaCategory: "NONE";
    };
  };
  visibility: {
    "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC";
  };
};

export class LinkedInPublisher implements Publisher {
  private token: string;
  private authorUrn: string;

  constructor() {
    this.token = (process.env.LINKEDIN_ACCESS_TOKEN ?? "").trim();
    if (!this.token) throw new Error("LINKEDIN_ACCESS_TOKEN missing in .env.");

    const asOrg = (process.env.LINKEDIN_POST_AS_ORG ?? "false").toLowerCase() === "true";
    const person = (process.env.LINKEDIN_AUTHOR_URN ?? "").trim();
    const org = (process.env.LINKEDIN_ORG_URN ?? "").trim();

    this.authorUrn = asOrg ? org : person;
    if (!this.authorUrn) {
      throw new Error("LinkedIn author URN missing. Set LINKEDIN_AUTHOR_URN or LINKEDIN_ORG_URN.");
    }
  }

  async publish(post: Post): Promise<void> {
    const payload: LinkedInPayload = {
      author: this.authorUrn,
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: { text: post.text },
          shareMediaCategory: "NONE"
        }
      },
      visibility: {
        "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
      }
    };

    const res = await fetch("https://api.linkedin.com/v2/ugcPosts", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.token}`,
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0"
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`LinkedIn post failed: ${res.status} ${res.statusText} :: ${body}`);
    }
  }
}