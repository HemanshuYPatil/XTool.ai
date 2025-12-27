import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import {
  ensureUserFromKinde,
  getUserWithSubscription,
  syncSubscriptionForUser,
} from "@/lib/billing";
import prisma from "@/lib/prisma";
import { isDeveloper } from "@/lib/developers";
import { CreatorLayout } from "@/components/creator/creator-layout";
import Link from "next/link";
import { CreditCardIcon, ZapIcon, HistoryIcon, ArrowUpRightIcon } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const { getUser } = getKindeServerSession();
  const user = await getUser();
  
  if (user) {
    try {
      await ensureUserFromKinde(user);
      await syncSubscriptionForUser(user.id);
    } catch (error) {
      console.error("Error syncing subscription:", error);
    }
  }
  const subscriptionData = user ? await getUserWithSubscription(user.id) : null;
  const developer = user ? await isDeveloper(user.id) : false;
  const subscription = subscriptionData?.subscription;
  const planLabel = developer
    ? "Developer"
    : subscriptionData?.plan === "PRO"
    ? "Xtreme"
    : "Free";
  const dailyLimitLabel =
    developer || subscriptionData?.plan === "PRO" ? "Unlimited" : "1";
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const [projectCount, projectCountToday] = user
    ? await Promise.all([
        prisma.project.count({
          where: { userId: user.id },
        }),
        prisma.project.count({
          where: { userId: user.id, createdAt: { gte: startOfDay } },
        }),
      ])
    : [0, 0];
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
    <CreatorLayout user={user}>
      <div className="space-y-12 py-8">
        <div className="space-y-3 border-b pb-8">
          <p className="text-xs uppercase tracking-[0.2em] text-primary font-bold">
            Billing
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Plans, invoices, and payment methods
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Manage your subscription details and keep track of spending.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="rounded-3xl border bg-primary/5 p-8 shadow-sm lg:col-span-2 space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Current plan</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {planLabel} plan billed monthly.
                </p>
              </div>
              <div className="rounded-full bg-primary/10 px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-primary border border-primary/20">
                Active
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border bg-background p-5 shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Price
                </p>
                <p className="mt-2 text-sm font-bold">{priceLabel} / mo</p>
              </div>
              <div className="rounded-2xl border bg-background p-5 shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Renewal
                </p>
                <p className="mt-2 text-sm font-bold">{renewalLabel}</p>
              </div>
              <div className="rounded-2xl border bg-background p-5 shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Seats
                </p>
                <p className="mt-2 text-sm font-bold">{seatsLabel}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {developer || subscriptionData?.plan === "PRO" ? (
                <Link
                  href={hasPortal ? "/api/billing/portal" : "/billing"}
                  className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground transition hover:opacity-90 shadow-lg shadow-primary/20"
                >
                  Manage billing <ArrowUpRightIcon className="ml-2 size-4" />
                </Link>
              ) : (
                <Link
                  href="/api/checkout"
                  className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground transition hover:opacity-90 shadow-lg shadow-primary/20"
                >
                  Upgrade to Xtreme <ZapIcon className="ml-2 size-4 fill-current" />
                </Link>
              )}
            </div>
          </div>

          <div className="rounded-3xl border bg-card/40 p-8 shadow-sm space-y-8">
            <div>
              <h2 className="text-xl font-bold">Payment method</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Securely manage your cards.
              </p>
            </div>
            <div className="rounded-2xl border bg-background/50 p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center">
                  <CreditCardIcon className="size-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-bold">Manage in Portal</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Secure Checkout</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {hasPortal
                  ? "Update cards, view invoices, and download receipts in your secure portal."
                  : "Upgrade to a paid plan to manage payment methods and view invoices."}
              </p>
            </div>
          </div>

          <div className="rounded-3xl border bg-card/40 p-8 shadow-sm lg:col-span-3 space-y-8">
            <div>
              <h2 className="text-xl font-bold">Usage and limits</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Track your production usage based on your current plan.
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-3">
              <div className="rounded-2xl border bg-background/50 p-5 transition-colors hover:border-primary/20">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Projects total
                </p>
                <p className="mt-2 text-sm font-bold">{projectCount}</p>
              </div>
              <div className="rounded-2xl border bg-background/50 p-5 transition-colors hover:border-primary/20">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Projects today
                </p>
                <p className="mt-2 text-sm font-bold">{projectCountToday}</p>
              </div>
              <div className="rounded-2xl border bg-background/50 p-5 transition-colors hover:border-primary/20">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Daily limit
                </p>
                <p className="mt-2 text-sm font-bold">{dailyLimitLabel}</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border bg-card/40 p-8 shadow-sm lg:col-span-3 space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Recent invoices</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Download your latest billing statements.
                </p>
              </div>
              <HistoryIcon className="size-5 text-muted-foreground" />
            </div>
            <div className="overflow-hidden rounded-2xl border">
              <div className="grid grid-cols-3 bg-muted/50 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                <div className="px-6 py-3">Date</div>
                <div className="px-6 py-3">Amount</div>
                <div className="px-6 py-3 text-right">Status</div>
              </div>
              <div className="divide-y text-sm">
                <div className="grid grid-cols-3 items-center">
                  <div className="px-6 py-4 font-medium">
                    {subscription?.currentPeriodStart
                      ? new Date(subscription.currentPeriodStart).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "--"}
                  </div>
                  <div className="px-6 py-4 font-medium">
                    {subscription?.amount
                      ? formatCurrency(subscription.amount, subscription.currency)
                      : "--"}
                  </div>
                  <div className="px-6 py-4 text-right">
                    <span className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest",
                      subscription?.status === "active" ? "bg-emerald-500/10 text-emerald-500" : "bg-muted text-muted-foreground"
                    )}>
                      {subscription?.status ?? "Free"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CreatorLayout>
  );
};

export default BillingPage;
