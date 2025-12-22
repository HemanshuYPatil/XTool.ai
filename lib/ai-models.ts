const DEFAULT_OPENROUTER_MODEL_FALLBACKS = [
  "google/gemma-3-27b-it:free",
  "xiaomi/mimo-v2-flash:free",
  "mistralai/devstral-2512:free",
  "nvidia/nemotron-nano-12b-v2-vl:free",
  "kwaipilot/kat-coder-pro:free",
  "meta-llama/llama-3.1-8b-instruct:free",
];

const envFallbacks =
  process.env.OPENROUTER_MODEL_FALLBACKS?.split(",")
    .map((model) => model.trim())
    .filter(Boolean) ?? [];

export const OPENROUTER_MODEL_FALLBACKS =
  envFallbacks.length > 0 ? envFallbacks : DEFAULT_OPENROUTER_MODEL_FALLBACKS;

export const OPENROUTER_MODEL_ID = OPENROUTER_MODEL_FALLBACKS[0];
export const GEMINI_MODEL_ID = "gemini-1.5-flash-latest";
// export const GEMINI_MODEL_ID = "google/gemini-1.5-flash:free";
