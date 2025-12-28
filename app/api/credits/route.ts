import { NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import prisma from "@/lib/prisma";
import { ensureUserCredits } from "@/lib/credits";
import { isDeveloper } from "@/lib/developers";

export async function GET() {
  const session = await getKindeServerSession();
  const user = await session.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await ensureUserCredits(user.id);
  const developer = await isDeveloper(user.id);

  if (developer) {
    return NextResponse.json({ credits: null, unlimited: true });
  }

  const record = await prisma.user.findUnique({
    where: { kindeId: user.id },
    select: { credits: true },
  });

  return NextResponse.json({
    credits: record?.credits ?? 0,
    unlimited: false,
  });
}
