import { NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import prisma from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { action, mode } = await request.json();
    const session = await getKindeServerSession();
    const user = await session.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!action || !["accept", "decline"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action." },
        { status: 400 }
      );
    }

    const contribution = await prisma.contribution.findFirst({
      where: { id },
      include: {
        project: true,
        frames: true,
      },
    });

    if (!contribution) {
      return NextResponse.json(
        { error: "Contribution not found." },
        { status: 404 }
      );
    }

    if (contribution.project.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    if (contribution.status !== "OPEN") {
      return NextResponse.json(
        { error: "Contribution already processed." },
        { status: 400 }
      );
    }

    if (action === "decline") {
      const updated = await prisma.contribution.update({
        where: { id },
        data: { status: "CLOSED" },
      });
      return NextResponse.json({ success: true, data: updated });
    }

    if (!mode || !["overwrite", "new"].includes(mode)) {
      return NextResponse.json(
        { error: "Mode is required." },
        { status: 400 }
      );
    }

    if (mode === "overwrite") {
      for (const frame of contribution.frames) {
        if (frame.frameId) {
          await prisma.frame.update({
            where: { id: frame.frameId },
            data: { htmlContent: frame.htmlContent },
          });
        } else {
          await prisma.frame.create({
            data: {
              projectId: contribution.projectId,
              title: frame.title,
              htmlContent: frame.htmlContent,
            },
          });
        }
      }
    } else {
      for (const frame of contribution.frames) {
        await prisma.frame.create({
          data: {
            projectId: contribution.projectId,
            title: frame.title,
            htmlContent: frame.htmlContent,
          },
        });
      }
    }

    const updated = await prisma.contribution.update({
      where: { id },
      data: { status: "MERGED" },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Error occured ", error);
    return NextResponse.json(
      { error: "Failed to process contribution." },
      { status: 500 }
    );
  }
}
