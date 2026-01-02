import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { inngest } from "@/inngest/client";
import { isDeveloper } from "@/lib/developers";
import { ensureUserCredits } from "@/lib/credits";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const session = await getKindeServerSession();
    const user = await session.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { frameId, prompt } = await request.json();

    if (!frameId || !prompt) {
      return NextResponse.json(
        { error: "frameId and prompt are required" },
        { status: 400 }
      );
    }
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: user.id,
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    await ensureUserCredits(user.id);
    const isDev = await isDeveloper(user.id);

    const frame = await prisma.frame.findFirst({
      where: {
        id: frameId,
        projectId: projectId,
      },
    });

    if (!frame) {
      return NextResponse.json({ error: "Frame not found" }, { status: 404 });
    }

    // Trigger inngest function
    await inngest.send({
      name: "ui/regenerate.frame",
      data: {
        userId: user.id,
        projectId: projectId,
        frameId: frameId,
        prompt: prompt,
        theme: project.theme,
        frame: frame,
        isDeveloper: isDev,
        projectName: project.name,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Frame regeneration started",
    });
  } catch (error) {
    console.error("Regenerate frame error:", error);
    return NextResponse.json(
      { error: "Failed to regenerate frame" },
      { status: 500 }
    );
  }
}
