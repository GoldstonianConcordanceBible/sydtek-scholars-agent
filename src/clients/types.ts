import { Post } from "../agent/types.js";

export interface Publisher {
  publish(post: Post): Promise<void>;
}