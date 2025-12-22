import { polar } from "@/lib/polar";
import { syncSubscriptionForUser, syncSubscriptionFromPolar } from "@/lib/billing";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export const dynamic = "force-dynamic";

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: { checkout_id?: string | string[] };
}) {
  const search = searchParams as Record<string, string | string[] | undefined>;
  const rawCheckoutId = search.checkout_id ?? search.checkoutId;
  const checkoutId = Array.isArray(rawCheckoutId)
    ? rawCheckoutId[0]
    : rawCheckoutId;
  const session = await getKindeServerSession();
  const user = await session.getUser();

  if (!checkoutId) {
    redirect("/billing");
  }

  let status = "processing";
  let shouldRedirect = false;
  try {
    const checkout = await polar.checkouts.get({ id: checkoutId });
    status = checkout.status ?? "open";

    if (checkout.subscriptionId) {
      const subscription = await polar.subscriptions.get({
        id: checkout.subscriptionId,
      });
      await syncSubscriptionFromPolar(subscription);
      shouldRedirect = true;
    } else if (user?.id) {
      const synced = await syncSubscriptionForUser(user.id);
      shouldRedirect = Boolean(synced);
    }
  } catch {
    if (user?.id) {
      const synced = await syncSubscriptionForUser(user.id);
      if (synced) {
        shouldRedirect = true;
      }
    }
    status = "processing";
  }

  if (shouldRedirect) {
    redirect("/billing");
  }

  return (
    <div className="min-h-screen w-full bg-background">
      <div className="mx-auto max-w-3xl px-6 pt-24">
        <div className="rounded-3xl border bg-card/70 p-8 shadow-sm text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-primary">
            Payment complete
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">
            Your subscription is ready
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Status: {status}
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              href="/billing"
              className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
            >
              Go to billing
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-full border border-border px-5 py-2 text-sm font-semibold transition hover:bg-muted/60"
            >
              Back home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
