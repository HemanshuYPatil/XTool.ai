import { NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { polar } from "@/lib/polar";
import { ensureUserFromKinde, getUserWithSubscription } from "@/lib/billing";

export async function GET(req: Request) {
  const session = await getKindeServerSession();
  const user = await session.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/api/auth/login", req.url));
  }

  await ensureUserFromKinde(user);
  const dbUser = await getUserWithSubscription(user.id);

  if (!dbUser?.polarCustomerId) {
    return NextResponse.redirect(new URL("/billing", req.url));
  }

  const returnUrl =
    process.env.NEXT_PUBLIC_APP_URL || `${new URL(req.url).origin}`;
  const sessionResult = await polar.customerSessions.create({
    customerId: dbUser.polarCustomerId,
    returnUrl: `${returnUrl}/billing`,
  });

  return NextResponse.redirect(sessionResult.customerPortalUrl);
}
