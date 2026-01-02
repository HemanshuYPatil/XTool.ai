import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { inngest } from "@/inngest/client";
import { ensureUserFromKinde } from "@/lib/billing";
import { ensureUserCredits } from "@/lib/credits";
import { isDeveloper } from "@/lib/developers";

export async function GET() {
  try {
    const session = await getKindeServerSession();
    const user = await session.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const projects = await prisma.project.findMany({
      where: {
        userId: user.id,
        OR: [{ deletedAt: null }, { deletedAt: { isSet: false } }],
      },
      take: 10,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: projects,
    });
  } catch (error) {
    console.error("Error occured ", error);
    return NextResponse.json(
      {
        error: "Failed to fetch projects",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();
    const session = await getKindeServerSession();
    const user = await session.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!prompt) throw new Error("Missing Prompt");

    const userId = user.id;
    await ensureUserFromKinde(user);
    await ensureUserCredits(userId);
    const isDev = await isDeveloper(userId);

    const projectName = "Q model";
    const project = await prisma.project.create({
      data: {
        userId,
        name: projectName,
        deletedAt: null,
      },
    });

    try {
      await inngest.send({
        name: "project/name.generate",
        data: {
          userId,
          projectId: project.id,
          prompt,
        },
      });
    } catch (error) {
      console.error(error);
    }

    //Trigger the Inngest
    try {
      await inngest.send({
        name: "ui/generate.screens",
        data: {
          userId,
          projectId: project.id,
          prompt,
          isDeveloper: isDev,
          projectName: project.name,
        },
      });
    } catch (error) {
      console.error(error);
    }

    return NextResponse.json({
      success: true,
      data: project,
    });
  } catch (error) {
    console.error("Error occured ", error);
    return NextResponse.json(
      {
        error: "Failed to create project",
      },
      { status: 500 }
    );
  }
}
