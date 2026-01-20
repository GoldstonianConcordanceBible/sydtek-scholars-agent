import cron from "node-cron";
import { generatePost } from "../agent/agent.js";
import { XPublisher } from "../clients/x.js";
import { LinkedInPublisher } from "../clients/linkedin.js";
import { TelegramPublisher } from "../clients/telegram.js";
import { DiscordPublisher } from "../clients/discord.js";
import { Publisher } from "../clients/types.js";

function boolEnv(key: string): boolean {
  return (process.env[key] ?? "false").toLowerCase() === "true";
}

function buildPublishers(): Publisher[] {
  const pubs: Publisher[] = [];

  if (boolEnv("POST_TO_X")) pubs.push(new XPublisher());
  if (boolEnv("POST_TO_LINKEDIN")) pubs.push(new LinkedInPublisher());
  if (boolEnv("POST_TO_TELEGRAM")) pubs.push(new TelegramPublisher());
  if (boolEnv("POST_TO_DISCORD")) pubs.push(new DiscordPublisher());

  return pubs;
}

async function postNow(): Promise<void> {
  const post = await generatePost();
  const publishers = buildPublishers();

  if (publishers.length === 0) {
    console.log("[Agent] No platforms enabled. Set POST_TO_* = true in .env");
    console.log("\n--- Generated Post Preview ---\n");
    console.log(post.text);
    console.log("\n-----------------------------\n");
    return;
  }

  for (const p of publishers) {
    await p.publish(post);
  }

  console.log(`[Agent] Posted successfully to ${publishers.length} platform(s).`);
}

export async function runOnceOrSchedule(opts: { once: boolean }): Promise<void> {
  if (opts.once) {
    await postNow();
    return;
  }

  const minutes = Number(process.env.POST_EVERY_MINUTES ?? "240");
  const m = Number.isFinite(minutes) && minutes > 0 ? minutes : 240;

  // Every N minutes: cron doesn't support variable minutes directly, so we approximate:
  // schedule every minute, run only when minute % N == 0
  console.log(`[Agent] Scheduler started. Will post every ~${m} minutes.`);
  cron.schedule("* * * * *", async () => {
    const now = new Date();
    const minute = now.getMinutes();
    const totalMinutes = now.getHours() * 60 + minute;
    if (totalMinutes % m !== 0) return;

    try {
      await postNow();
    } catch (err) {
      console.error("[Agent] Posting error:", err);
    }
  });
}