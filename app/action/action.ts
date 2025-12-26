"use server";
import { OPENROUTER_PROJECT_NAME_MODEL_ID } from "@/lib/ai-models";

const toTwoWordTitle = (input: string) => {
  const cleaned = input
    .replace(/[`"'’“”]/g, "")
    .replace(/[^a-zA-Z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!cleaned) {
    return "New Project";
  }
  const words = cleaned.split(" ").filter(Boolean);
  const picked = words.slice(0, 2).map((word) => {
    const [first, ...rest] = word;
    return `${first?.toUpperCase() ?? ""}${rest.join("").toLowerCase()}`;
  });
  return picked.join(" ");
};

export async function generateProjectName(prompt: string) {
  try {
    if (!process.env.OPENROUTER_API_KEY) {
      return toTwoWordTitle(prompt);
    }

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "http-referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost",
          "x-title": "XTool.ai",
        },
        body: JSON.stringify({
          model: OPENROUTER_PROJECT_NAME_MODEL_ID,
          messages: [
            {
              role: "system",
              content: [
                "You generate a short two-word project name based on the user's prompt.",
                "- Return exactly two words.",
                "- Capitalize words appropriately.",
                "- Do not include special characters.",
                "- Return only the name, no quotes.",
              ].join("\n"),
            },
            { role: "user", content: prompt },
          ],
          max_tokens: 12,
          temperature: 0.2,
        }),
      }
    );

    if (!response.ok) {
      return toTwoWordTitle(prompt);
    }

    const data = await response.json();
    const text = (
      data?.choices?.[0]?.message?.content ??
      data?.choices?.[0]?.delta?.content ??
      ""
    ).trim();

    return text ? toTwoWordTitle(text) : toTwoWordTitle(prompt);
  } catch (error) {
    console.log(error);
    return toTwoWordTitle(prompt);
  }
}
