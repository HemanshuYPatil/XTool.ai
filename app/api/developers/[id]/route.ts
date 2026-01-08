import { NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { canManageDevelopers, removeDeveloper } from "@/lib/developers";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getKindeServerSession();
  const user = await session.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const canManage = await canManageDevelopers(user.id);
  if (!canManage) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const kindeId = id?.trim();
  if (!kindeId) {
    return NextResponse.json({ error: "Missing developer id" }, { status: 400 });
  }

  try {
    await removeDeveloper(kindeId);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Developer not found" }, { status: 404 });
  }
}
