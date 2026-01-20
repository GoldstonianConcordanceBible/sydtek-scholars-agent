export type Platform = "x" | "linkedin" | "telegram" | "discord";

export type Post = {
  text: string;
  platformHints?: Partial<Record<Platform, { maxLength?: number }>>;
  meta?: Record<string, unknown>;
};