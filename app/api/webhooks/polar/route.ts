import { NextResponse } from "next/server";
import { validateEvent } from "@polar-sh/sdk/webhooks";
import { syncSubscriptionFromPolar } from "@/lib/billing";

export async function POST(req: Request) {
  const body = await req.text();
  const secret = process.env.POLAR_WEBHOOK_SECRET;

  if (!secret) {
    return NextResponse.json(
      { error: "Webhook secret missing" },
      { status: 400 }
    );
  }

  const headerEntries = Object.fromEntries(req.headers.entries());

  try {
    const event = validateEvent(body, headerEntries, secret);

    // Check for specific subscription events
    if (
      event.type === "subscription.created" ||
      event.type === "subscription.updated" ||
      event.type === "subscription.active" ||
      event.type === "subscription.canceled" ||
      event.type === "subscription.revoked"
    ) {
      await syncSubscriptionFromPolar(event.data); // Now TypeScript knows it's a Subscription
    }
  } catch (error) {
    return NextResponse.json({ error: "Invalid webhook" }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
