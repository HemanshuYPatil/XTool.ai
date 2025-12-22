import { tool } from "ai";
import { z } from "zod";

export const unsplashTool = tool({
  name: "searchUnsplash",
  description:
    "Search for high-quality images from Unsplash.  Use this when you need to add an <img> tag.",
  inputSchema: z.object({
    query: z
      .string()
      .describe("Image search query (e.g. 'modern loft', 'finance graph')"),
    orientation: z
      .enum(["landscape", "portrait", "squarish"])
      .default("landscape"),
  }),
  outputSchema: z.string(),
  execute: async ({ query, orientation }) => {
    try {
      const res = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
          query
        )}&orientation=${orientation}&per_page=1&client_id=${
          process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY
        }`
      );
      const { results } = await res.json();
      if (results?.[0]?.urls?.regular) {
        return results[0].urls.regular;
      }
      return `https://source.unsplash.com/featured/800x600?${encodeURIComponent(
        query
      )}`;
    } catch {
      return `https://source.unsplash.com/featured/800x600?${encodeURIComponent(
        query
      )}`;
    }
  },
});
