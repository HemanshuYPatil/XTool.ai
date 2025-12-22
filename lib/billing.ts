import prisma from "@/lib/prisma";
import { Plan } from "@/lib/generated/prisma/client";
import { polar } from "@/lib/polar";
import type { Subscription } from "@polar-sh/sdk/models/components/subscription";

type KindeUserProfile = {
  id: string;
  email?: string | null;
  given_name?: string | null;
  family_name?: string | null;
};

const PRO_PRICE_ID = process.env.POLAR_PRO_PRICE_ID;
const PRO_PRODUCT_ID = process.env.POLAR_PRO_PRODUCT_ID;

const isActiveStatus = (status?: string | null) =>
  status === "active" || status === "trialing";

const getPlanForSubscription = (
  priceId?: string | null,
  status?: string | null,
  productId?: string | null
) => {
  const matchesPrice = Boolean(PRO_PRICE_ID && priceId === PRO_PRICE_ID);
  const matchesProduct = Boolean(PRO_PRODUCT_ID && productId === PRO_PRODUCT_ID);

  if (!matchesPrice && !matchesProduct) return Plan.FREE;
  return isActiveStatus(status) ? Plan.PRO : Plan.FREE;
};

export const ensureUserFromKinde = async (user: KindeUserProfile) => {
  const fullName = [user.given_name, user.family_name].filter(Boolean).join(" ");
  return prisma.user.upsert({
    where: { kindeId: user.id },
    create: {
      kindeId: user.id,
      email: user.email ?? undefined,
      name: fullName || undefined,
      plan: Plan.FREE,
    },
    update: {
      email: user.email ?? undefined,
      name: fullName || undefined,
    },
  });
};

export const getUserWithSubscription = (kindeId: string) =>
  prisma.user.findUnique({
    where: { kindeId },
    include: { subscription: true },
  });

export const syncSubscriptionFromPolar = async (subscription: Subscription) => {
  const externalId = subscription.customer?.externalId;
  if (!externalId) return null;

  const priceId = subscription.prices?.[0]?.id ?? null;
  const plan = getPlanForSubscription(
    priceId,
    subscription.status,
    subscription.productId ?? null
  );

  await prisma.user.upsert({
    where: { kindeId: externalId },
    create: {
      kindeId: externalId,
      email: subscription.customer?.email ?? undefined,
      name: subscription.customer?.name ?? undefined,
      plan,
      polarCustomerId: subscription.customerId,
    },
    update: {
      plan,
      polarCustomerId: subscription.customerId,
    },
  });

  await prisma.subscription.upsert({
    where: { userId: externalId },
    create: {
      userId: externalId,
      polarSubscriptionId: subscription.id,
      polarCustomerId: subscription.customerId,
      status: subscription.status,
      currentPeriodStart: subscription.currentPeriodStart ?? undefined,
      currentPeriodEnd: subscription.currentPeriodEnd ?? undefined,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd ?? false,
      priceId: priceId ?? undefined,
      productId: subscription.productId ?? undefined,
      seats: subscription.seats ?? undefined,
      amount: subscription.amount ?? undefined,
      currency: subscription.currency ?? undefined,
    },
    update: {
      polarSubscriptionId: subscription.id,
      polarCustomerId: subscription.customerId,
      status: subscription.status,
      currentPeriodStart: subscription.currentPeriodStart ?? undefined,
      currentPeriodEnd: subscription.currentPeriodEnd ?? undefined,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd ?? false,
      priceId: priceId ?? undefined,
      productId: subscription.productId ?? undefined,
      seats: subscription.seats ?? undefined,
      amount: subscription.amount ?? undefined,
      currency: subscription.currency ?? undefined,
    },
  });

  return { kindeId: externalId, plan };
};

export const syncSubscriptionForUser = async (kindeId: string) => {
  const iterator = await polar.subscriptions.list({
    externalCustomerId: kindeId,
    sorting: ["-started_at"],
    limit: 1,
  });
  const subscription = iterator.result.items[0];
  if (!subscription) return null;
  return syncSubscriptionFromPolar(subscription);
};
