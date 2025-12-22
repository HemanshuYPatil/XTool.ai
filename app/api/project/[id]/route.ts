import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { inngest } from "@/inngest/client";
import {
  ensureUserFromKinde,
  getUserWithSubscription,
} from "@/lib/billing";
import { isThemeAllowedForPlan } from "@/lib/themes";

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
    const dbUser = await getUserWithSubscription(user.id);

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
      plan: dbUser?.plan ?? "FREE",
    });
  } catch (error) {
    console.log(error);
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
    const dbUser = await getUserWithSubscription(userId);
    const plan = dbUser?.plan ?? "FREE";
    const project = await prisma.project.findFirst({
      where: {
        id,
        userId: user.id,
        OR: [{ deletedAt: null }, { deletedAt: { isSet: false } }],
      },
      include: { frames: true },
    });

    if (!project) throw new Error("Project not found");
    if (plan === "FREE" && project.frames.length >= 1) {
      return NextResponse.json(
        { error: "Free plan supports one layout per project." },
        { status: 403 }
      );
    }

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
          plan,
        },
      });
    } catch (error) {
      console.log(error);
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.log("Error occured ", error);
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
    const { themeId, name } = await request.json();
    const session = await getKindeServerSession();
    const user = await session.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!themeId && !name) throw new Error("Missing update payload");

    const userId = user.id;
    let plan: string | undefined;

    if (themeId) {
      await ensureUserFromKinde(user);
      const dbUser = await getUserWithSubscription(userId);
      plan = dbUser?.plan ?? "FREE";

      if (!isThemeAllowedForPlan(themeId, plan)) {
        return NextResponse.json(
          { error: "Theme not available on the free plan." },
          { status: 403 }
        );
      }
    }

    const project = await prisma.project.update({
      where: { id, userId },
      data: {
        ...(themeId ? { theme: themeId } : {}),
        ...(name ? { name } : {}),
      },
    });

    return NextResponse.json({
      success: true,
      project,
    });
  } catch (error) {
    console.log("Error occured ", error);
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
    console.log("Error occured ", error);
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 }
    );
  }
}
