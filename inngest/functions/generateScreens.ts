import { generateObject, generateText, stepCountIs } from "ai";
import { inngest } from "../client";
import { z } from "zod";
import { FrameType } from "@/types/project";
import {
  ANALYSIS_PROMPT,
  GENERATION_SYSTEM_PROMPT,
  PRO_STYLE_PROMPT,
} from "@/lib/prompt";
import prisma from "@/lib/prisma";
import {
  BASE_VARIABLES,
  THEME_LIST,
  getThemesForPlan,
} from "@/lib/themes";
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
import {
  calculateTokenCost,
  getUsageTokenCount,
  recordCreditSummary,
  deductCredits,
} from "@/lib/credits";
import { buildCreditReason } from "@/lib/credit-reason";
import {
  publishFrame,
  publishProjectStatus,
  publishCreditSummaryUpdate,
} from "@/lib/convex-client";

const AnalysisSchema = z.object({
  theme: z
    .string()
    .describe(
      "The specific visual theme ID (e.g., 'midnight', 'ocean-breeze', 'neo-brutalism')."
    ),
  screens: z
    .array(
      z.object({
        id: z
          .string()
          .describe(
            "Unique identifier for the screen (e.g., 'home-dashboard', 'profile-settings', 'transaction-history'). Use kebab-case."
          ),
        name: z
          .string()
          .describe(
            "Short, descriptive name of the screen (e.g., 'Home Dashboard', 'Profile', 'Transaction History')"
          ),
        purpose: z
          .string()
          .describe(
            "One clear sentence explaining what this screen accomplishes for the user and its role in the app"
          ),
        visualDescription: z
          .string()
          .describe(
            "A dense, high-fidelity visual directive (like an image generation prompt). Describe the layout, specific data examples (e.g. 'Oct-Mar'), component hierarchy, and physical attributes (e.g. 'Chunky cards', 'Floating header','Floating action button', 'Bottom navigation',Header with user avatar)."
          ),
      })
    )
    .min(1)
    .max(6),
});

const model = openrouterAi(OPENROUTER_MODEL_ID);
type CreditFailure = { creditFailure: true; message: string };
const isCreditFailure = (value: unknown): value is CreditFailure =>
  Boolean((value as CreditFailure | undefined)?.creditFailure);
const PLACEHOLDER_PROJECT_NAME = "Q model";

export const generateScreens = inngest.createFunction(
  { id: "generate-ui-screens" },
  { event: "ui/generate.screens" },
  async ({ event, step }) => {
    const {
      userId,
      projectId,
      prompt,

      frames,
      theme: existingTheme,
      isDeveloper,
      projectName: eventProjectName,
    } = event.data;
    let projectName = (eventProjectName ?? null) as string | null;
    const resolveProjectName = async () => {
      if (projectName && projectName !== PLACEHOLDER_PROJECT_NAME) {
        return projectName;
      }
      const project = await prisma.project.findFirst({
        where: { id: projectId, userId },
        select: { name: true },
      });
      projectName = project?.name ?? projectName ?? null;
      return projectName;
    };
    const isExistingGeneration = Array.isArray(frames) && frames.length > 0;
    const creditSummary = {
      totalAmount: 0,
      totalTokens: 0,
      totalPromptTokens: 0,
      totalCompletionTokens: 0,
      details: [] as { amount: number; reason: string; modelTokens?: number }[],
    };
    const recordCreditDetail = (detail: {
      amount: number;
      reason: string;
      modelTokens?: number;
      promptTokens?: number;
      completionTokens?: number;
    }) => {
      if (isDeveloper) return;
      if (!detail.amount) return;
      creditSummary.totalAmount += detail.amount;
      if (detail.modelTokens) creditSummary.totalTokens += detail.modelTokens;
      if (detail.promptTokens) creditSummary.totalPromptTokens += detail.promptTokens;
      if (detail.completionTokens)
        creditSummary.totalCompletionTokens += detail.completionTokens;
      creditSummary.details.push({
        amount: detail.amount,
        reason: detail.reason,
        modelTokens: detail.modelTokens,
      });
    };
    const summaryId = `generation:${projectId}:${Date.now()}`;
    const summaryCreatedAt = Date.now();
    let summaryPublished = false;
    const publishCreditSummary = async () => {
      if (summaryPublished || isDeveloper) return;
      if (!creditSummary.totalAmount) return;
      summaryPublished = true;
      const resolvedProjectName = await resolveProjectName();
      await recordCreditSummary({
        kindeId: userId,
        amount: creditSummary.totalAmount,
        reason: "screens.generate",
        projectName: resolvedProjectName,
        modelTokens: creditSummary.totalTokens || undefined,
        promptTokens: creditSummary.totalPromptTokens || undefined,
        completionTokens: creditSummary.totalCompletionTokens || undefined,
        details: creditSummary.details,
        transactionId: summaryId,
      });
    };
    const updateRealtimeSummary = async () => {
      if (isDeveloper || !creditSummary.totalAmount) return;
      const resolvedProjectName = await resolveProjectName();
      await publishCreditSummaryUpdate({
        userId,
        transactionId: summaryId,
        amount: creditSummary.totalAmount,
        reason: buildCreditReason("screens.generate", resolvedProjectName),
        modelTokens: creditSummary.totalTokens || undefined,
        promptTokens: creditSummary.totalPromptTokens || undefined,
        completionTokens: creditSummary.totalCompletionTokens || undefined,
        createdAt: summaryCreatedAt,
        details: creditSummary.details,
      });
    };
    const failForCredits = async (message: string): Promise<CreditFailure> => {
      await publishProjectStatus({
        projectId,
        userId,
        status: "failed",
        message,
      });
      return { creditFailure: true, message };
    };

    await publishProjectStatus({
      projectId,
      userId,
      status: "running",
    });

    try {
      //Analyze or plan
      const analysisResult = await step.run("analyze-and-plan-screens", async () => {
        await publishProjectStatus({
          projectId,
          userId,
          status: "analyzing",
        });

      const contextHTML = isExistingGeneration
        ? frames
            .map(
              (frame: FrameType) =>
                `<!-- ${frame.title} -->\n${frame.htmlContent}`
            )
            .join("\n\n")
        : "";

      const analysisPrompt = isExistingGeneration
        ? `
          USER REQUEST: ${prompt}
          SELECTED THEME: ${existingTheme}

          EXISTING SCREENS (analyze for consistency navigation, layout, design system etc):
          ${contextHTML}

         CRITICAL REQUIREMENTS A MUST - READ CAREFULLY:
          - **Analyze the existing screens' layout, navigation patterns, and design system
          - **Extract the EXACT bottom navigation component structure and styling
          - **Identify common components (cards, buttons, headers) for reuse
          - **Maintain the same visual hierarchy and spacing
          - **Generate new screens that seamlessly blend with existing ones
        `.trim()
        : `
          USER REQUEST: ${prompt}
        `.trim();

      const availableThemes = getThemesForPlan();
      const fallbackTheme =
        availableThemes[0]?.id ?? THEME_LIST[0]?.id ?? "midnight";

      const buildFallbackAnalysis = () => ({
        theme: fallbackTheme,
        screens: [
          {
            id: "home",
            name: "Home",
            purpose: "Primary landing screen for the requested experience.",
            visualDescription:
              "Clean, minimal dashboard with hero summary, key actions, and a primary content list tailored to the request.",
          },
          {
            id: "detail",
            name: "Detail",
            purpose: "Focused detail view for a primary item or feature.",
            visualDescription:
              "Dedicated detail layout with prominent media, metadata stack, and contextual actions.",
          },
          {
            id: "activity",
            name: "Activity",
            purpose: "Timeline or history of recent actions and updates.",
            visualDescription:
              "Feed-style layout with card rows, timestamps, and status chips.",
          },
          {
            id: "profile",
            name: "Profile",
            purpose: "User profile and settings overview.",
            visualDescription:
              "Minimal profile header with avatar, stats, and settings cards.",
          },
        ],
      });

      let object: z.infer<typeof AnalysisSchema>;
      try {
        const result = await generateObject({
          model,
          schema: AnalysisSchema,
          system: ANALYSIS_PROMPT,
          prompt: analysisPrompt,
          maxOutputTokens: 2000,
        });
        object = result.object;
      } catch {
        try {
          const result = await generateText({
            model,
            system: ANALYSIS_PROMPT,
            prompt: `${analysisPrompt}\n\nReturn ONLY valid JSON matching the schema. No prose, no markdown.`,
            maxOutputTokens: 2000,
          });
          const raw = result.text ?? "";
          const cleaned = raw.replace(/```(?:json)?/g, "").trim();
          const match = cleaned.match(/\{[\s\S]*\}/);
          object = match
            ? AnalysisSchema.parse(JSON.parse(match[0]))
            : buildFallbackAnalysis();
        } catch {
          object = buildFallbackAnalysis();
        }
      }

      const maxScreens = 5;
      const minScreens = 4;
      const screens = object.screens.length >= minScreens
        ? object.screens.slice(0, maxScreens)
        : [
            ...object.screens,
            ...object.screens.slice(0, minScreens - object.screens.length),
          ].slice(0, maxScreens);
      const rawTheme = isExistingGeneration ? existingTheme : object.theme;
      const themeToUse = rawTheme ?? fallbackTheme;

      if (!isExistingGeneration) {
        await prisma.project.update({
          where: {
            id: projectId,
            userId: userId,
          },
          data: { theme: themeToUse },
        });
      }

      await publishProjectStatus({
        projectId,
        userId,
        status: "generating",
        themeId: themeToUse,
        totalScreens: screens.length,
      });
      await Promise.all(
        screens.map((screen, index) =>
          publishFrame({
            projectId,
            userId,
            frameId: screen.id,
            title: screen.name,
            htmlContent: "",
            isLoading: true,
            order: index,
          })
        )
      );

      return { ...object, screens, themeToUse };
    });
      if (isCreditFailure(analysisResult)) return;
      const analysis = analysisResult;

    // Actuall generation of each screens
    const generatedFrames: typeof frames = isExistingGeneration
      ? [...frames]
      : [];

      for (let i = 0; i < analysis.screens.length; i++) {
      const screenPlan = analysis.screens[i];
      const selectedTheme = THEME_LIST.find(
        (t) => t.id === analysis.themeToUse
      );

      //Combine the Theme Styles + Base Variable
      const fullThemeCSS = `
        ${BASE_VARIABLES}
        ${selectedTheme?.style || ""}
      `;

      // Get all previous existing or generated frames
      const allPreviousFrames = generatedFrames.slice(0, i);
      const previousFramesContext = allPreviousFrames
        .map((f: FrameType) => `<!-- ${f.title} -->\n${f.htmlContent}`)
        .join("\n\n");

        const generationResult = await step.run(`generated-screen-${i}`, async () => {
        const proStyle = `\nPRO STYLE REFERENCE:\n${PRO_STYLE_PROMPT}\n`;
        const buildPrompt = (extraInstruction?: string) => `
          USER REQUEST: ${prompt}
          INTERNAL BRIEF: Refine the user request into a clearer, more modern, minimal, and creative design direction before generating. Do not output the brief.

          - Screen ${i + 1}/${analysis.screens.length}
          - Screen ID: ${screenPlan.id}
          - Screen Name: ${screenPlan.name}
          - Screen Purpose: ${screenPlan.purpose}

          VISUAL DESCRIPTION: ${screenPlan.visualDescription}
          ${proStyle}

          EXISTING SCREENS REFERENCE (Extract and reuse their components):
          ${previousFramesContext || "No previous screens"}

          THEME VARIABLES (Reference ONLY - already defined in parent, do NOT redeclare these):
          ${fullThemeCSS}

        CRITICAL REQUIREMENTS A MUST - READ CAREFULLY:
        - **If previous screens exist, COPY the EXACT bottom navigation component structure and styling - do NOT recreate it
        - **Extract common components (cards, buttons, headers) and reuse their styling
        - **Maintain the exact same visual hierarchy, spacing, and color scheme
        - **This screen should look like it belongs in the same app as the previous screens

        1. **Generate ONLY raw HTML markup for this mobile app screen using Tailwind CSS.**
          Use Tailwind classes for layout, spacing, typography, shadows, etc.
          Use theme CSS variables ONLY for color-related properties (bg-[var(--background)], text-[var(--foreground)], border-[var(--border)], ring-[var(--ring)], etc.)
        2. **All content must be inside a single root <div> that controls the layout.**
          - No overflow classes on the root.
          - All scrollable content must be in inner containers with hidden scrollbars: [&::-webkit-scrollbar]:hidden scrollbar-none
        3. **For absolute overlays (maps, bottom sheets, modals, etc.):**
          - Use \`relative w-full h-screen\` on the top div of the overlay.
        4. **For regular content:**
          - Use \`w-full h-full min-h-screen\` on the top div.
        5. **Do not use h-screen on inner content unless absolutely required.**
          - Height must grow with content; content must be fully visible inside an iframe.
        6. **For z-index layering:**
          - Ensure absolute elements do not block other content unnecessarily.
        7. **Output raw HTML only, starting with <div>.**
          - Do not include markdown, comments, <html>, <body>, or <head>.
        8. **Hardcode a style only if a theme variable is not needed for that element.**
        9. **Ensure iframe-friendly rendering:**
          - All elements must contribute to the final scrollHeight so your parent iframe can correctly resize.
        10. **Never output markdown links or plain URLs. If you use an image, always render it as an <img> tag.**
        11. **Do not add explanatory text, image source text, or conversational sentences.**
        12. **Include at least one <img> that uses searchUnsplash output for the main visual.**
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
            return { text: result.text ?? "", usage: result.usage };
          } catch {
            const result = await generateText({
              model,
              system: GENERATION_SYSTEM_PROMPT,
              stopWhen: stepCountIs(5),
              prompt: buildPrompt(extraInstruction),
              maxOutputTokens: 3000,
            });
            return { text: result.text ?? "", usage: result.usage };
          }
        };

        let final = await runGeneration();
        if (isCreditFailure(final)) return final;
        let finalHtml = final.text;

        if (!isLikelyHtml(finalHtml) || !isLikelyUiHtml(finalHtml)) {
          final = await runGeneration(
            "Return ONLY raw HTML that starts with <div>. No prose, no markdown, no links, no source mentions."
          );
          if (isCreditFailure(final)) return final;
          finalHtml = final.text;
        }

        const totalTokens = getUsageTokenCount(final.usage);
        const amount = calculateTokenCost(totalTokens);
        if (amount > 0 && !isDeveloper) {
          const charge = await deductCredits({
            kindeId: userId,
            amount,
            reason: "screens.generate",
            modelTokens: totalTokens,
            publishRealtime: true,
            recordTransaction: false,
          });
          if (!charge.ok) {
            await publishCreditSummary();
            return await failForCredits("Not enough credits to generate screens.");
          }
          recordCreditDetail({
            amount: -amount,
            reason: `screens.generate:${screenPlan.id}`,
            modelTokens: totalTokens,
          });
          await updateRealtimeSummary();
        }

        const extracted = extractHtmlRoot(finalHtml) ?? finalHtml;
        const sanitized = sanitizeGeneratedHtml(
          extracted.replace(/```/g, "")
        );
        const cleanedHtml = isLikelyUiHtml(sanitized)
          ? sanitized
          : buildFallbackHtml({
              title: screenPlan.name,
              subtitle: screenPlan.purpose,
            });

        //Create the frame
        const frame = await prisma.frame.create({
          data: {
            projectId,
            title: screenPlan.name,
            htmlContent: cleanedHtml,
          },
        });

        // Add to generatedFrames for next iteration's context
        generatedFrames.push(frame);

        await publishFrame({
          projectId,
          userId,
          frameId: frame.id,
          title: frame.title,
          htmlContent: frame.htmlContent,
          isLoading: false,
          order: i,
          replaceFrameId: screenPlan.id,
        });

        return { success: true, frame: frame };
      });
        if (isCreditFailure(generationResult)) return;
      }

      await publishProjectStatus({
        projectId,
        userId,
        status: "completed",
      });
    } finally {
      await publishCreditSummary();
    }
  }
);
