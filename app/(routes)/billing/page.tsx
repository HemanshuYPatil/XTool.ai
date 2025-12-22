import Header from "../_common/header";
import Link from "next/link";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import {
  ensureUserFromKinde,
  getUserWithSubscription,
  syncSubscriptionForUser,
} from "@/lib/billing";

const formatCurrency = (amount?: number | null, currency?: string | null) => {
  if (amount == null || !currency) return "Not available";
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  } catch {
    return `${amount} ${currency.toUpperCase()}`;
  }
};

const BillingPage = async () => {
  const session = await getKindeServerSession();
  const user = await session.getUser();
  if (user) {
    await ensureUserFromKinde(user);
    await syncSubscriptionForUser(user.id);
  }
  const subscriptionData = user ? await getUserWithSubscription(user.id) : null;
  const subscription = subscriptionData?.subscription;
  const planLabel = subscriptionData?.plan === "PRO" ? "Xtreme" : "Free";
  const priceLabel =
    subscriptionData?.plan === "PRO"
      ? formatCurrency(subscription?.amount, subscription?.currency)
      : "$0";
  const renewalLabel = subscription?.currentPeriodEnd
    ? new Date(subscription.currentPeriodEnd).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Not scheduled";
  const seatsLabel = subscription?.seats
    ? `${subscription.seats} seat${subscription.seats === 1 ? "" : "s"}`
    : "1 seat";
  const hasPortal = Boolean(subscriptionData?.polarCustomerId);
  return (
    <div className="min-h-screen w-full bg-background">
      <Header />

      <section className="pt-16 pb-10">
        <div className="mx-auto max-w-6xl px-6">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.2em] text-primary">
              Billing
            </p>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
              Plans, invoices, and payment methods
            </h1>
            <p className="text-foreground/80 max-w-2xl">
              Manage your subscription details and keep track of spending.
            </p>
          </div>
        </div>
      </section>

      <section className="pb-16">
        <div className="mx-auto max-w-6xl px-6 grid gap-6 lg:grid-cols-3">
          <div className="rounded-3xl border bg-primary/10 p-6 shadow-sm lg:col-span-2">
            <h2 className="text-lg font-semibold">Current plan</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {planLabel} plan billed monthly.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <div className="rounded-2xl border border-border/60 bg-background px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Price
                </p>
                <p className="mt-2 text-sm font-medium">
                  {priceLabel} / month
                </p>
              </div>
              <div className="rounded-2xl border border-border/60 bg-background px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Renewal
                </p>
                <p className="mt-2 text-sm font-medium">{renewalLabel}</p>
              </div>
              <div className="rounded-2xl border border-border/60 bg-background px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Seats
                </p>
                <p className="mt-2 text-sm font-medium">{seatsLabel}</p>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              {subscriptionData?.plan === "PRO" ? (
                <Link
                  href={hasPortal ? "/api/billing/portal" : "/billing"}
                  className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
                >
                  Manage billing
                </Link>
              ) : (
                <Link
                  href="/api/checkout"
                  className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
                >
                  Upgrade to Xtreme
                </Link>
              )}
              <span className="text-xs text-muted-foreground">
                {subscription?.status
                  ? `Status: ${subscription.status}`
                  : "Status: Free"}
              </span>
            </div>
          </div>
          <div className="rounded-3xl border bg-card/70 p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Payment method</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Manage your payment methods in the customer portal.
            </p>
            <div className="mt-6 rounded-2xl border border-border/60 bg-background p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Portal
              </p>
              <p className="mt-2 text-sm font-medium">
                {hasPortal ? "Open customer portal" : "Not available"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {hasPortal
                  ? "Update cards, invoices, and receipts."
                  : "Upgrade to access portal tools."}
              </p>
            </div>
          </div>

          <div className="rounded-3xl border bg-card/70 p-6 shadow-sm lg:col-span-3">
            <h2 className="text-lg font-semibold">Recent invoices</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Invoices are available in the customer portal.
            </p>
            <div className="mt-6 overflow-hidden rounded-2xl border border-border/60">
              <div className="grid grid-cols-3 bg-muted/30 text-xs uppercase tracking-wide text-muted-foreground">
                <div className="px-4 py-3">Date</div>
                <div className="px-4 py-3">Amount</div>
                <div className="px-4 py-3">Status</div>
              </div>
              <div className="divide-y divide-border/60 text-sm">
                <div className="grid grid-cols-3">
                  <div className="px-4 py-3 text-muted-foreground">
                    {subscription?.currentPeriodStart
                      ? new Date(
                          subscription.currentPeriodStart
                        ).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "--"}
                  </div>
                  <div className="px-4 py-3 text-muted-foreground">
                    {subscription?.amount
                      ? formatCurrency(
                          subscription.amount,
                          subscription.currency
                        )
                      : "--"}
                  </div>
                  <div className="px-4 py-3 text-muted-foreground">
                    {subscription?.status ?? "Free"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BillingPage;
