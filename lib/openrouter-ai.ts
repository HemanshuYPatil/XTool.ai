import { createOpenRouter } from "@openrouter/ai-sdk-provider";

export const openrouterAi = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY!,
});
