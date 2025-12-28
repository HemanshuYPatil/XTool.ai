import prisma from "@/lib/prisma";
import { INITIAL_CREDITS } from "@/lib/credits";

type KindeUserProfile = {
  id: string;
  email?: string | null;
  given_name?: string | null;
  family_name?: string | null;
};

export const ensureUserFromKinde = async (user: KindeUserProfile) => {
  const fullName = [user.given_name, user.family_name].filter(Boolean).join(" ");
  return prisma.user.upsert({
    where: { kindeId: user.id },
    create: {
      kindeId: user.id,
      email: user.email ?? undefined,
      name: fullName || undefined,
      credits: INITIAL_CREDITS,
    },
    update: {
      email: user.email ?? undefined,
      name: fullName || undefined,
    },
  });
};

export const getUserByKindeId = (kindeId: string) =>
  prisma.user.findUnique({
    where: { kindeId },
  });
