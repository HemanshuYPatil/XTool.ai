import { NextResponse } from "next/server";
import { polar } from "@/lib/polar";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { ensureUserFromKinde, getUserWithSubscription } from "@/lib/billing";

const buildCheckout = async (
  user: { id: string; email?: string | null },
  baseUrl: string
) => {
  const productId = process.env.POLAR_PRO_PRODUCT_ID as string;
  const successUrl =
    process.env.POLAR_SUCCESS_URL ||
    `${baseUrl}/success?checkout_id={CHECKOUT_ID}`;
  const returnUrl = process.env.POLAR_CANCEL_URL || `${baseUrl}/billing`;
  const missing: string[] = [];
  if (!productId) missing.push("POLAR_PRO_PRODUCT_ID");
  if (!successUrl) missing.push("POLAR_SUCCESS_URL");
  if (!returnUrl) missing.push("POLAR_CANCEL_URL");
//   if (missing.length) {
//     const error = new Error("Missing checkout configuration");
//     (error as Error & { missing?: string[] }).missing = missing;
//     throw error;
//   }

  const checkout = await polar.checkouts.create({
    products: [productId],
    successUrl,
    returnUrl,
    externalCustomerId: user.id,
    customerEmail: user.email ?? undefined,
    allowDiscountCodes: true,
    requireBillingAddress: false,
    allowTrial: true,
    isBusinessCustomer: false,
  });

  return checkout;
};

export async function GET(req: Request) {
  const session = await getKindeServerSession();
  const user = await session.getUser();
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin;

  if (!user) {
    return NextResponse.redirect(new URL("/api/auth/login", req.url));
  }

  await ensureUserFromKinde(user);
  const existing = await getUserWithSubscription(user.id);
  if (existing?.plan === "PRO" && existing.subscription?.status === "active") {
    return NextResponse.redirect(new URL("/billing", req.url));
  }

  try {
    const checkout = await buildCheckout(user, baseUrl);
    return NextResponse.redirect(checkout.url);
  } catch (error) {
    const err = error as { missing?: string[]; message?: string };
    return NextResponse.json(
      {
        error: "Checkout failed.",
        missing: err.missing ?? [],
        detail: err.message ?? "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  const session = await getKindeServerSession();
  const user = await session.getUser();
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await ensureUserFromKinde(user);
  try {
    const checkout = await buildCheckout(user, baseUrl);
    return NextResponse.json({ url: checkout.url });
  } catch (error) {
    const err = error as { missing?: string[]; message?: string };
    return NextResponse.json(
      {
        error: "Checkout failed.",
        missing: err.missing ?? [],
        detail: err.message ?? "Unknown error",
      },
      { status: 500 }
    );
  }
}
