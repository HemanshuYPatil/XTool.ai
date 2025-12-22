"use server";
import { GEMINI_MODEL_ID } from "@/lib/ai-models";

export async function generateProjectName(prompt: string) {
  try {
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      return "Untitled Project";
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL_ID}:generateContent?key=${process.env.GOOGLE_GENERATIVE_AI_API_KEY}`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          systemInstruction: {
            parts: [
              {
                text: [
                  "You are an AI assistant that generates very very short project names based on the user's prompt.",
                  "- Keep it under 5 words.",
                  "- Capitalize words appropriately.",
                  "- Do not include special characters.",
                ].join("\n"),
              },
            ],
          },
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      return "Untitled Project";
    }

    const data = await response.json();
    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ??
      data?.candidates?.[0]?.content?.parts?.find(
        (part: { text?: string }) => typeof part?.text === "string"
      )?.text;

    return text?.trim() || "Untitled Project";
  } catch (error) {
    console.log(error);
    return "Untitled Project";
  }
}
