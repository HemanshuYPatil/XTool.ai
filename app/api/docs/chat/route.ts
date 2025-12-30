import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { streamText } from "ai";
import { docsContent } from "@/lib/docs-content";
import { OPENROUTER_MODEL_ID } from "@/lib/ai-models";

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

export async function POST(req: Request) {
  const { messages } = await req.json();

  // Prepare the documentation context
  const context = Object.values(docsContent)
    .map((section) => `### ${section.title}\n${section.content}`)
    .join("\n\n");

  const systemPrompt = `
You are the XTool.ai Documentation Agent. Your goal is to provide efficient and simple solutions based on the provided documentation.
Be intelligent, text-based, and concise. Use the documentation context below to answer user queries.
If the information is not in the documentation, politely inform the user and suggest they contact support.

Documentation Context:
${context}

Style Guidelines:
- Clean, minimal, and simple language.
- Use markdown for formatting.
- Be helpful and professional.
`;

  const result = await streamText({
    model: openrouter(OPENROUTER_MODEL_ID || "meta-llama/llama-3.1-8b-instruct:free"),
    system: systemPrompt,
    messages,
  });

  return result.toDataStreamResponse();
}
