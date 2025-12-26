import { NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import prisma from "@/lib/prisma";
import { randomBytes } from "crypto";

const generateToken = () => randomBytes(24).toString("base64url");

export async function POST(request: Request) {
  try {
    const { projectId, frameId, permission } = await request.json();
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

    const normalizedPermission =
      permission === "EDIT" ? "EDIT" : "READ_ONLY";

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

    if (frameId) {
      const frame = await prisma.frame.findFirst({
        where: { id: frameId, projectId },
      });
      if (!frame) {
        return NextResponse.json(
          { error: "Frame not found." },
          { status: 404 }
        );
      }
    }

    const existingLink = await prisma.shareLink.findFirst({
      where: {
        projectId,
        frameId: frameId ?? undefined,
        permission: normalizedPermission,
        createdBy: user.id,
      },
    });

    const shareLink =
      existingLink ??
      (await prisma.shareLink.create({
        data: {
          token: generateToken(),
          projectId,
          frameId: frameId ?? undefined,
          permission: normalizedPermission,
          createdBy: user.id,
        },
      }));

    const origin =
      request.headers.get("origin") ?? process.env.NEXT_PUBLIC_APP_URL ?? "";
    const shareUrl = origin
      ? `${origin}/share/${shareLink.token}`
      : `/share/${shareLink.token}`;

    return NextResponse.json({
      success: true,
      token: shareLink.token,
      url: shareUrl,
      permission: shareLink.permission,
    });
  } catch (error) {
    console.log("Error occured ", error);
    return NextResponse.json(
      { error: "Failed to create share link." },
      { status: 500 }
    );
  }
}
