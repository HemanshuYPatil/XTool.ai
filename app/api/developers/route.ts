import { NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { addDeveloper, canManageDevelopers, listDevelopers } from "@/lib/developers";

export async function GET() {
  const session = await getKindeServerSession();
  const user = await session.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const canManage = await canManageDevelopers(user.id);
  if (!canManage) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const developers = await listDevelopers();
  return NextResponse.json({
    data: developers.map((dev) => ({
      id: dev.id,
      kindeId: dev.kindeId,
      createdAt: dev.createdAt,
    })),
  });
}

export async function POST(request: Request) {
  const session = await getKindeServerSession();
  const user = await session.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const canManage = await canManageDevelopers(user.id);
  if (!canManage) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await request.json();
  const kindeId = typeof body?.kindeId === "string" ? body.kindeId.trim() : "";
  if (!kindeId) {
    return NextResponse.json(
      { error: "kindeId is required" },
      { status: 400 }
    );
  }
  const developer = await addDeveloper(kindeId);
  return NextResponse.json({
    data: {
      id: developer.id,
      kindeId: developer.kindeId,
      createdAt: developer.createdAt,
    },
  });
}
