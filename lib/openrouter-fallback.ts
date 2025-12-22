import type { CallModelInput, Tool } from "@openrouter/sdk";
import { OPENROUTER_MODEL_FALLBACKS } from "@/lib/ai-models";
import { openrouter } from "@/lib/openrouter";

const isRetryableModelError = (error: unknown) => {
  if (!error || typeof error !== "object") {
    return false;
  }
  const message = "message" in error ? String(error.message) : "";
  const name = "name" in error ? String(error.name) : "";
  const status = "statusCode" in error ? Number(error.statusCode) : NaN;
  const code = "code" in error ? String(error.code) : "";
  return (
    name.includes("TooManyRequests") ||
    name.includes("NotFound") ||
    message.includes("TooManyRequests") ||
    message.includes("Provider returned error") ||
    message.includes("No endpoints found") ||
    code === "server_error" ||
    code === "provider_error" ||
    status === 429 ||
    status === 404 ||
    status === 502 ||
    status === 503 ||
    status === 504
  );
};

type CallTextOptions<TTools extends readonly Tool[] = readonly Tool[]> = {
  input: CallModelInput<TTools>["input"];
  tools?: TTools;
  stopWhen?: CallModelInput<TTools>["stopWhen"];
};

export const callOpenRouterText = async ({
  input,
  tools,
  stopWhen,
}: CallTextOptions) => {
  let lastError: unknown;

  for (const model of OPENROUTER_MODEL_FALLBACKS) {
    try {
      const result = openrouter.callModel({
        model,
        input,
        ...(tools ? { tools } : {}),
        ...(stopWhen ? { stopWhen } : {}),
      });
      return (await result.getText()) ?? "";
    } catch (error) {
      lastError = error;
      if (isRetryableModelError(error)) {
        continue;
      }
      throw error;
    }
  }

  throw lastError ?? new Error("All OpenRouter free models are rate-limited.");
};
