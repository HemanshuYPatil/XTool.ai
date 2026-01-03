"use server";
import { OPENROUTER_PROJECT_NAME_MODEL_ID } from "@/lib/ai-models";

const toTwoWordName = (input: string) => {
  const words = input
    .replace(/[^a-zA-Z0-9\s-]/g, " ")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean);

  const cleaned = words
    .slice(0, 2)
    .map((word) => {
      const letters = word.replace(/[^a-zA-Z0-9]/g, "");
      if (!letters) return "";
      return letters[0].toUpperCase() + letters.slice(1).toLowerCase();
    })
    .filter(Boolean);

  if (cleaned.length) {
    return cleaned.join(" ");
  }

  return "New Project";
};

const normalizeProjectName = (input: string) => {
  const words = input
    .replace(/[^a-zA-Z0-9\s-]/g, " ")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean)
    .slice(0, 2);

  return words
    .map((word) => {
      const letters = word.replace(/[^a-zA-Z0-9]/g, "");
      if (!letters) return "";
      return letters[0].toUpperCase() + letters.slice(1).toLowerCase();
    })
    .filter(Boolean)
    .join(" ");
};

export async function generateProjectName(prompt: string) {
  try {
    if (!process.env.OPENROUTER_NAME_API_KEY) {
      return toTwoWordName(prompt);
    }

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${process.env.OPENROUTER_NAME_API_KEY}`,
          "http-referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost",
          "x-title": "XTool.ai",
        },
        body: JSON.stringify({
          model: OPENROUTER_PROJECT_NAME_MODEL_ID,
          messages: [
            {
              role: "system",
              content: [
                "Generate a short project name based on the user's prompt.",
                "- Return a name with a maximum of two words.",
                "- Use Title Case words (e.g., Travel Planner).",
                "- No punctuation or quotes.",
                "- Return only the name, no extra text.",
              ].join("\n"),
            },
            { role: "user", content: prompt },
          ],
          max_tokens: 8,
          temperature: 0.2,
        }),
      }
    );

    if (!response.ok) {
      return toTwoWordName(prompt);
    }

    const data = await response.json();
    const text = (
      data?.choices?.[0]?.message?.content ??
      data?.choices?.[0]?.delta?.content ??
      ""
    ).trim();

    const normalized = text ? normalizeProjectName(text) : "";
    return normalized || toTwoWordName(prompt);
  } catch (error) {
    console.error(error);
    return toTwoWordName(prompt);
  }
}
