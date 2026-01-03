import { Webhooks } from "@polar-sh/nextjs";
import prisma from "@/lib/prisma";
import { publishCreditTransaction, publishUserCredits } from "@/lib/convex-client";
import { ensureUserCredits } from "@/lib/credits";
import { isDeveloper } from "@/lib/developers";
import { getPlanByKey, getPlanByPriceId } from "@/lib/polar-plans";

const parseCredits = (value: unknown) => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.floor(value);
  }
  if (typeof value === "string") {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const parseString = (value: unknown) =>
  typeof value === "string" && value.trim() ? value.trim() : null;

export const POST = Webhooks({
  webhookSecret: process.env.POLAR_WEBHOOK_SECRET ?? "",
  onOrderPaid: async (payload) => {
    const order = payload.data;
    if (!order?.paid) return;

    const metadata = order.metadata ?? {};
    const kindeId = parseString(metadata.kindeId);

    if (!kindeId) {
      console.warn("Polar webhook missing kindeId metadata.");
      return;
    }

    const developer = await isDeveloper(kindeId);
    if (developer) return;

    const planFromMetadata = getPlanByKey(parseString(metadata.planKey));
    const priceId =
      order.items?.[0]?.productPriceId ?? order.productId ?? null;
    const planFromPrice = getPlanByPriceId(priceId);
    const credits =
      parseCredits(metadata.credits) ??
      planFromMetadata?.credits ??
      planFromPrice?.credits ??
      null;

    if (!credits || credits <= 0) {
      console.warn("Polar webhook missing credit amount.");
      return;
    }

    const reason = `Polar order ${order.id}`;
    const existing = await prisma.creditTransaction.findFirst({
      where: { reason },
      select: { id: true },
    });
    if (existing) return;

    await ensureUserCredits(kindeId);

    const result = await prisma.$transaction(async (tx) => {
      const updatedUser = await tx.user.update({
        where: { kindeId },
        data: { credits: { increment: credits } },
        select: { credits: true },
      });
      const transaction = await tx.creditTransaction.create({
        data: {
          userId: kindeId,
          amount: credits,
          reason,
          details: {
            source: "polar",
            orderId: order.id,
            checkoutId: order.checkoutId,
            planKey: planFromMetadata?.key ?? planFromPrice?.key ?? null,
            planName: planFromMetadata?.name ?? planFromPrice?.name ?? null,
            priceId,
          },
        },
        select: {
          id: true,
          amount: true,
          reason: true,
          createdAt: true,
        },
      });
      return { credits: updatedUser.credits, transaction };
    });

    await publishUserCredits({ userId: kindeId, credits: result.credits });
    await publishCreditTransaction({
      userId: kindeId,
      transactionId: result.transaction.id,
      amount: result.transaction.amount,
      reason: result.transaction.reason,
      createdAt: result.transaction.createdAt.getTime(),
    });
  },
});
