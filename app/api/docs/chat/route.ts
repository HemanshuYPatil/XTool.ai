import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { streamText } from "ai";
import { OPENROUTER_MODEL_ID } from "@/lib/ai-models";
import { searchDocs } from "@/lib/mcp-docs-client";

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

export async function POST(req: Request) {
  const { messages } = await req.json();

  const lastUserMessage =
    [...messages].reverse().find((message: any) => message.role === "user")
      ?.content ?? "";

  let matches = [];
  try {
    matches = await searchDocs(lastUserMessage, 8);
  } catch (error) {
    const errorPrompt = `
You are the XTool.ai documentation assistant. The documentation system is currently unavailable.
Respond briefly that the docs system is offline and ask the user to try again or contact support.
`;

    const result = await streamText({
      model: openrouter(OPENROUTER_MODEL_ID || "meta-llama/llama-3.1-8b-instruct:free"),
      system: errorPrompt,
      messages,
    });

    return result.toTextStreamResponse();
  }

  if (matches.length === 0) {
    const refusalPrompt = `
You are the XTool.ai documentation assistant. You only answer questions that are explicitly covered by the product documentation.
If the user's question is not about XTool.ai or is not answered by documentation, refuse briefly and suggest contacting support.
`;

    const result = await streamText({
      model: openrouter(OPENROUTER_MODEL_ID || "meta-llama/llama-3.1-8b-instruct:free"),
      system: refusalPrompt,
      messages,
    });

    return result.toTextStreamResponse();
  }

  const context = matches
    .map((match, index) => {
      return `Source ${index + 1}:\nTitle: ${match.title}\nURI: ${match.uri}\nExcerpt: ${match.excerpt}`;
    })
    .join("\n\n");

  const systemPrompt = `
You are the XTool.ai Documentation Agent. Your goal is to provide efficient and simple solutions based on the provided documentation.
Be intelligent, text-based, and concise. Use only the documentation context below to answer user queries.
If the answer is not explicitly in the context, refuse and suggest contacting support.
Do not answer unrelated questions.

Documentation Context:
${context}

Style Guidelines:
- Clean, minimal, and simple language.
- Use markdown for formatting.
- Be helpful and professional.
- End responses with a short "Sources:" list using the URI values when you cite information.
`;

  const result = await streamText({
    model: openrouter(OPENROUTER_MODEL_ID || "meta-llama/llama-3.1-8b-instruct:free"),
    system: systemPrompt,
    messages,
  });

  return result.toTextStreamResponse();
}
