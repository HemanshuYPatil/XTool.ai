"use server";
import { OPENROUTER_PROJECT_NAME_MODEL_ID } from "@/lib/ai-models";

const toShortName = (input: string) => {
  const lettersOnly = input.replace(/[^a-zA-Z]/g, "").toUpperCase();
  if (lettersOnly.length >= 3) {
    return lettersOnly.slice(0, 4);
  }
  const words = input
    .replace(/[^a-zA-Z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean);
  const initials = words.map((word) => word[0] ?? "").join("").toUpperCase();
  const merged = `${initials}${lettersOnly}`.replace(/[^A-Z]/g, "");
  if (merged.length >= 3) {
    return merged.slice(0, 4);
  }
  return "QMOD";
};

export async function generateProjectName(prompt: string) {
  try {
    if (!process.env.OPENROUTER_NAME_API_KEY) {
      return toShortName(prompt);
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
                "Generate a 3-4 letter project code based on the user's prompt.",
                "- Return only 3-4 uppercase letters (A-Z).",
                "- No spaces, digits, punctuation, or words.",
                "- Return only the code, no quotes.",
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
      return toShortName(prompt);
    }

    const data = await response.json();
    const text = (
      data?.choices?.[0]?.message?.content ??
      data?.choices?.[0]?.delta?.content ??
      ""
    ).trim();

    return text ? toShortName(text) : toShortName(prompt);
  } catch (error) {
    console.error(error);
    return toShortName(prompt);
  }
}
