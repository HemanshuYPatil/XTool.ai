import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { inngest } from "@/inngest/client";
import {
  ensureUserFromKinde,
} from "@/lib/billing";
import { isDeveloper } from "@/lib/developers";
import { ensureUserCredits } from "@/lib/credits";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getKindeServerSession();
    const user = await session.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const project = await prisma.project.findFirst({
      where: {
        userId: user.id,
        id: id,
        OR: [{ deletedAt: null }, { deletedAt: { isSet: false } }],
      },
      include: {
        frames: true,
      },
    });
    if (!project) {
      return NextResponse.json(
        {
          error: "Project not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...project,
      isDeveloper: await isDeveloper(user.id),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        error: "Fail to fetch project",
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { prompt } = await request.json();
    const session = await getKindeServerSession();
    const user = await session.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!prompt) throw new Error("Missing Prompt");

    const userId = user.id;
    await ensureUserFromKinde(user);
    const isDev = await isDeveloper(userId);
    const project = await prisma.project.findFirst({
      where: {
        id,
        userId: user.id,
        OR: [{ deletedAt: null }, { deletedAt: { isSet: false } }],
      },
      include: { frames: true },
    });

    if (!project) throw new Error("Project not found");
    await ensureUserCredits(userId);

    //Trigger the Inngest
    try {
      await inngest.send({
        name: "ui/generate.screens",
        data: {
          userId,
          projectId: id,
          prompt,
          frames: project.frames,
          theme: project.theme,
          isDeveloper: isDev,
          projectName: project.name,
        },
      });
    } catch (error) {
      console.error(error);
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Error occured ", error);
    return NextResponse.json(
      {
        error: "Failed to generate frame",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { themeId, name, visibility } = await request.json();
    const session = await getKindeServerSession();
    const user = await session.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!themeId && !name && !visibility) {
      throw new Error("Missing update payload");
    }
    if (
      visibility &&
      visibility !== "PRIVATE" &&
      visibility !== "PUBLIC"
    ) {
      return NextResponse.json(
        { error: "Invalid visibility option." },
        { status: 400 }
      );
    }

    const userId = user.id;
    const isDev = await isDeveloper(userId);

    if (themeId) {
      await ensureUserFromKinde(user);
    }

    const project = await prisma.project.update({
      where: { id, userId },
      data: {
        ...(themeId ? { theme: themeId } : {}),
        ...(name ? { name } : {}),
        ...(visibility ? { visibility } : {}),
      },
    });

    return NextResponse.json({
      success: true,
      project,
    });
  } catch (error) {
    console.error("Error occured ", error);
    return NextResponse.json(
      {
        error: "Failed to update project",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getKindeServerSession();
    const user = await session.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const project = await prisma.project.findFirst({
      where: {
        id,
        userId: user.id,
        OR: [{ deletedAt: null }, { deletedAt: { isSet: false } }],
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    await prisma.frame.deleteMany({
      where: { projectId: id },
    });
    await prisma.project.update({
      where: { id, userId: user.id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error occured ", error);
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 }
    );
  }
}
