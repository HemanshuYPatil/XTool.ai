import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { publishFrame } from "@/lib/convex-client";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const session = await getKindeServerSession();
    const user = await session.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { frameId, htmlContent } = await request.json();

    if (!frameId || !htmlContent) {
      return NextResponse.json(
        { error: "frameId and htmlContent are required" },
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
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const frame = await prisma.frame.findFirst({
      where: {
        id: frameId,
        projectId,
      },
    });

    if (!frame) {
      return NextResponse.json({ error: "Frame not found" }, { status: 404 });
    }

    const updated = await prisma.frame.update({
      where: { id: frameId },
      data: { htmlContent },
    });

    await publishFrame({
      projectId,
      userId: user.id,
      frameId: updated.id,
      title: updated.title,
      htmlContent: updated.htmlContent,
      isLoading: false,
    });

    return NextResponse.json({
      success: true,
      frame: updated,
    });
  } catch (error) {
    console.error("Update frame error:", error);
    return NextResponse.json(
      { error: "Failed to update frame" },
      { status: 500 }
    );
  }
}
