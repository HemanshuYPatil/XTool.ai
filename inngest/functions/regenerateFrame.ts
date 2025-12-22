import { generateText, stepCountIs } from "ai";
import { inngest } from "../client";
import {
  GENERATION_SYSTEM_PROMPT,
  PRO_STYLE_PROMPT,
} from "@/lib/prompt";
import prisma from "@/lib/prisma";
import { BASE_VARIABLES, THEME_LIST } from "@/lib/themes";
import { unsplashTool } from "../tool";
import {
  buildFallbackHtml,
  extractHtmlRoot,
  isLikelyHtml,
  isLikelyUiHtml,
  sanitizeGeneratedHtml,
} from "@/lib/html-sanitize";
import { openrouterAi } from "@/lib/openrouter-ai";
import { OPENROUTER_MODEL_ID } from "@/lib/ai-models";

const model = openrouterAi(OPENROUTER_MODEL_ID);

export const regenerateFrame = inngest.createFunction(
  { id: "regenerate-frame" },
  { event: "ui/regenerate.frame" },
  async ({ event, step, publish }) => {
    const {
      userId,
      projectId,
      frameId,
      prompt,
      theme: themeId,
      frame,
      plan,
    } = event.data;
    const CHANNEL = `user:${userId}`;

    await publish({
      channel: CHANNEL,
      topic: "generation.start",
      data: {
        status: "generating",
        projectId: projectId,
      },
    });

    // Generate new frame with the user's prompt
    await step.run("regenerate-screen", async () => {
      const selectedTheme = THEME_LIST.find((t) => t.id === themeId);

      //Combine the Theme Styles + Base Variable
      const fullThemeCSS = `
        ${BASE_VARIABLES}
        ${selectedTheme?.style || ""}
      `;

      const proStyle =
        plan === "PRO" ? `\nPRO STYLE REFERENCE:\n${PRO_STYLE_PROMPT}\n` : "";
      const buildPrompt = (extraInstruction?: string) => `
        USER REQUEST: ${prompt}
        ${proStyle}

        ORIGINAL SCREEN TITLE: ${frame.title}
        ORIGINAL SCREEN HTML: ${frame.htmlContent}

        THEME VARIABLES (Reference ONLY - already defined in parent, do NOT redeclare these): ${fullThemeCSS}


        CRITICAL REQUIREMENTS A MUST - READ CAREFULLY:
        1. **PRESERVE the overall structure and layout - ONLY modify what the user explicitly requested**
          - Keep all existing components, styling, and layout that are NOT mentioned in the user request
          - Only change the specific elements the user asked for
          - Do not add or remove sections unless requested
          - Maintain the exact same HTML structure and CSS classes except for requested changes

        2. **Generate ONLY raw HTML markup for this mobile app screen using Tailwind CSS.**
          Use Tailwind classes for layout, spacing, typography, shadows, etc.
          Use theme CSS variables ONLY for color-related properties (bg-[var(--background)], text-[var(--foreground)], border-[var(--border)], ring-[var(--ring)], etc.)
        3. **All content must be inside a single root <div> that controls the layout.**
          - No overflow classes on the root.
          - All scrollable content must be in inner containers with hidden scrollbars: [&::-webkit-scrollbar]:hidden scrollbar-none
        4. **For absolute overlays (maps, bottom sheets, modals, etc.):**
          - Use \`relative w-full h-screen\` on the top div of the overlay.
        5. **For regular content:**
          - Use \`w-full h-full min-h-screen\` on the top div.
        6. **Do not use h-screen on inner content unless absolutely required.**
          - Height must grow with content; content must be fully visible inside an iframe.
        7. **For z-index layering:**
          - Ensure absolute elements do not block other content unnecessarily.
        8. **Output raw HTML only, starting with <div>.**
          - Do not include markdown, comments, <html>, <body>, or <head>.
        9. **Ensure iframe-friendly rendering:**
            - All elements must contribute to the final scrollHeight so your parent iframe can correctly resize.
        10. **Never output markdown links or plain URLs. If you use an image, always render it as an <img> tag.**
        11. **Do not add explanatory text, image source text, or conversational sentences.**
        Generate the complete, production-ready HTML for this screen now.
        ${extraInstruction ?? ""}
        `.trim();

      const runGeneration = async (extraInstruction?: string) => {
        try {
          const result = await generateText({
            model,
            system: GENERATION_SYSTEM_PROMPT,
            tools: {
              searchUnsplash: unsplashTool,
            },
            stopWhen: stepCountIs(5),
            prompt: buildPrompt(extraInstruction),
            maxOutputTokens: 3000,
          });
          return result.text ?? "";
        } catch {
          const result = await generateText({
            model,
            system: GENERATION_SYSTEM_PROMPT,
            stopWhen: stepCountIs(5),
            prompt: buildPrompt(extraInstruction),
            maxOutputTokens: 3000,
          });
          return result.text ?? "";
        }
      };

      let finalHtml = await runGeneration();

      if (!isLikelyHtml(finalHtml) || !isLikelyUiHtml(finalHtml)) {
        finalHtml = await runGeneration(
          "Return ONLY raw HTML that starts with <div>. No prose, no markdown, no links, no source mentions."
        );
      }

      const extracted = extractHtmlRoot(finalHtml) ?? finalHtml;
      const sanitized = sanitizeGeneratedHtml(extracted.replace(/```/g, ""));
      const cleanedHtml = isLikelyUiHtml(sanitized)
        ? sanitized
        : buildFallbackHtml({
            title: frame.title,
            subtitle: "Regenerated preview",
          });

      // Update the frame
      const updatedFrame = await prisma.frame.update({
        where: {
          id: frameId,
        },
        data: {
          htmlContent: cleanedHtml,
        },
      });

      await publish({
        channel: CHANNEL,
        topic: "frame.created",
        data: {
          frame: updatedFrame,
          screenId: frameId,
          projectId: projectId,
        },
      });

      return { success: true, frame: updatedFrame };
    });

    await publish({
      channel: CHANNEL,
      topic: "generation.complete",
      data: {
        status: "completed",
        projectId: projectId,
      },
    });
  }
);
