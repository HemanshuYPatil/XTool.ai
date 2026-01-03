import { NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { POLAR_PLANS, type PolarPlanKey } from "@/lib/polar-plans";

export async function POST(req: Request) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();
  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized", loginUrl: "/api/auth/login" },
      { status: 401 }
    );
  }

  const body = await req.json().catch(() => null);
  const planKey = body?.plan as PolarPlanKey | undefined;
  const plan = planKey ? POLAR_PLANS[planKey] : null;

  if (!plan) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const metadata = {
    kindeId: user.id,
    credits: plan.credits,
    planKey: plan.key,
    planName: plan.name,
  };

  const checkoutUrl = new URL("/api/checkout", req.url);
  checkoutUrl.searchParams.append("products", plan.priceId);
  checkoutUrl.searchParams.set("customerExternalId", user.id);

  if (user.email) {
    checkoutUrl.searchParams.set("customerEmail", user.email);
  }

  const fullName = [user.given_name, user.family_name]
    .filter(Boolean)
    .join(" ")
    .trim();
  if (fullName) {
    checkoutUrl.searchParams.set("customerName", fullName);
  }

  checkoutUrl.searchParams.set("metadata", JSON.stringify(metadata));

  return NextResponse.json({ url: checkoutUrl.toString() });
}
