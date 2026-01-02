import { NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import prisma from "@/lib/prisma";
import { generateText, stepCountIs } from "ai";
import { openrouterAi } from "@/lib/openrouter-ai";
import { OPENROUTER_MODEL_ID } from "@/lib/ai-models";
import {
  buildFallbackHtml,
  extractHtmlRoot,
  isLikelyHtml,
  isLikelyUiHtml,
  sanitizeGeneratedHtml,
} from "@/lib/html-sanitize";
import { GENERATION_SYSTEM_PROMPT, PRO_STYLE_PROMPT } from "@/lib/prompt";
import { BASE_VARIABLES, THEME_LIST } from "@/lib/themes";
import { unsplashTool } from "@/inngest/tool";
import { isDeveloper } from "@/lib/developers";
import {
  ensureUserCredits,
  MIN_PROMPT_CREDITS,
  getUsageTokenBreakdown,
  reserveMinimumCredits,
  settleUsageCharge,
} from "@/lib/credits";

const model = openrouterAi(OPENROUTER_MODEL_ID);

const buildContributionTitle = (prompt: string, frameTitle: string) =>
  `${frameTitle}: ${prompt.slice(0, 60).trim()}`.trim();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");
    const session = await getKindeServerSession();
    const user = await session.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!projectId) {
      return NextResponse.json(
        { error: "Project is required." },
        { status: 400 }
      );
    }

    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: user.id,
        OR: [{ deletedAt: null }, { deletedAt: { isSet: false } }],
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found." },
        { status: 404 }
      );
    }

    const contributions = await prisma.contribution.findMany({
      where: {
        projectId,
        status: "OPEN",
      },
      include: {
        author: true,
        frames: {
          include: {
            frame: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: contributions });
  } catch (error) {
    console.error("Error occured ", error);
    return NextResponse.json(
      { error: "Failed to fetch contributions." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { token, frameId, prompt, htmlContent } = await request.json();
    const session = await getKindeServerSession();
    const user = await session.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!token || !frameId || (!prompt && !htmlContent)) {
      return NextResponse.json(
        { error: "Missing contribution payload." },
        { status: 400 }
      );
    }

    const shareLink = await prisma.shareLink.findUnique({
      where: { token },
      include: { project: true, frame: true },
    });

    if (!shareLink || shareLink.permission !== "EDIT") {
      return NextResponse.json(
        { error: "Share link does not allow edits." },
        { status: 403 }
      );
    }

    if (shareLink.frameId && shareLink.frameId !== frameId) {
      return NextResponse.json(
        { error: "Share link does not allow edits on this frame." },
        { status: 403 }
      );
    }

    const frame = await prisma.frame.findFirst({
      where: { id: frameId, projectId: shareLink.projectId },
    });

    if (!frame) {
      return NextResponse.json({ error: "Frame not found." }, { status: 404 });
    }
    const projectName = shareLink.project?.name;

    let cleanedHtml = "";

    if (typeof htmlContent === "string" && htmlContent.trim()) {
      const extracted = extractHtmlRoot(htmlContent) ?? htmlContent;
      const sanitized = sanitizeGeneratedHtml(extracted.replace(/```/g, ""));
      cleanedHtml = isLikelyUiHtml(sanitized)
        ? sanitized
        : buildFallbackHtml({
            title: frame.title,
            subtitle: "Contribution preview",
          });
    } else {
      const contributorIsDev = await isDeveloper(user.id);
      await ensureUserCredits(user.id);
      const userCredits = await prisma.user.findUnique({
        where: { kindeId: user.id },
        select: { credits: true },
      });
      if (!contributorIsDev && (userCredits?.credits ?? 0) < MIN_PROMPT_CREDITS) {
        return NextResponse.json(
          { error: "Not enough credits to generate content." },
          { status: 402 }
        );
      }

      const selectedTheme = THEME_LIST.find(
        (theme) => theme.id === shareLink.project.theme
      );
      const fullThemeCSS = `
        ${BASE_VARIABLES}
        ${selectedTheme?.style || ""}
      `;
      const proStyle = `\nPRO STYLE REFERENCE:\n${PRO_STYLE_PROMPT}\n`;

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
        3. **All content must be inside a single root <div> that controls the layout.**
        4. **Output raw HTML only, starting with <div>.**
        5. **Never output markdown links or plain URLs.**
        Generate the complete, production-ready HTML for this screen now.
        ${extraInstruction ?? ""}
      `.trim();

      const runGeneration = async (extraInstruction?: string) => {
        try {
          const minimumCharge = await reserveMinimumCredits({
            kindeId: user.id,
            reason: "contribution.generate.minimum",
            projectName,
          });
          if (!minimumCharge.ok) {
            throw new Error("NOT_ENOUGH_CREDITS");
          }
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
          const { totalTokens, promptTokens, completionTokens } =
            getUsageTokenBreakdown(result.usage);
          const settle = await settleUsageCharge({
            kindeId: user.id,
            usageTokens: totalTokens,
            promptTokens,
            completionTokens,
            reason: "contribution.generate",
            projectName,
          });
          if (!settle.ok) {
            throw new Error("NOT_ENOUGH_CREDITS");
          }
          return { text: result.text ?? "", usage: result.usage };
        } catch {
          const minimumCharge = await reserveMinimumCredits({
            kindeId: user.id,
            reason: "contribution.generate.retry.minimum",
            projectName,
          });
          if (!minimumCharge.ok) {
            throw new Error("NOT_ENOUGH_CREDITS");
          }
          const result = await generateText({
            model,
            system: GENERATION_SYSTEM_PROMPT,
            stopWhen: stepCountIs(5),
            prompt: buildPrompt(extraInstruction),
            maxOutputTokens: 3000,
          });
          const { totalTokens, promptTokens, completionTokens } =
            getUsageTokenBreakdown(result.usage);
          const settle = await settleUsageCharge({
            kindeId: user.id,
            usageTokens: totalTokens,
            promptTokens,
            completionTokens,
            reason: "contribution.generate.retry",
            projectName,
          });
          if (!settle.ok) {
            throw new Error("NOT_ENOUGH_CREDITS");
          }
          return { text: result.text ?? "", usage: result.usage };
        }
      };

      let final: { text: string; usage?: any };
      try {
        final = await runGeneration();
      } catch (error) {
        if ((error as Error).message === "NOT_ENOUGH_CREDITS") {
          return NextResponse.json(
            { error: "Not enough credits to generate content." },
            { status: 402 }
          );
        }
        throw error;
      }
      let finalHtml = final.text;
      if (!isLikelyHtml(finalHtml) || !isLikelyUiHtml(finalHtml)) {
        try {
          final = await runGeneration(
            "Return ONLY raw HTML that starts with <div>. No prose, no markdown, no links, no source mentions."
          );
        } catch (error) {
          if ((error as Error).message === "NOT_ENOUGH_CREDITS") {
            return NextResponse.json(
              { error: "Not enough credits to generate content." },
              { status: 402 }
            );
          }
          throw error;
        }
        finalHtml = final.text;
      }

      const extracted = extractHtmlRoot(finalHtml) ?? finalHtml;
      const sanitized = sanitizeGeneratedHtml(extracted.replace(/```/g, ""));
      cleanedHtml = isLikelyUiHtml(sanitized)
        ? sanitized
        : buildFallbackHtml({
            title: frame.title,
            subtitle: "Contribution preview",
          });
    }

    const contribution = await prisma.contribution.create({
      data: {
        projectId: shareLink.projectId,
        authorId: user.id,
        title: buildContributionTitle(prompt, frame.title),
        summary: prompt.trim().slice(0, 160),
        frames: {
          create: [
            {
              frameId: frame.id,
              title: frame.title,
              htmlContent: cleanedHtml,
            },
          ],
        },
      },
      include: {
        frames: {
          include: {
            frame: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: contribution,
    });
  } catch (error) {
    console.error("Error occured ", error);
    return NextResponse.json(
      { error: "Failed to create contribution." },
      { status: 500 }
    );
  }
}
