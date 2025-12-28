import prisma from "@/lib/prisma";

export const isDeveloper = async (kindeId: string) => {
  const bootstrapId = process.env.DEV_BOOTSTRAP_ID?.trim();
  const targetId = kindeId?.trim();

  if (bootstrapId && targetId && bootstrapId === targetId) {
    return true;
  }
  const developer = await prisma.developer.findUnique({
    where: { kindeId },
  });
  return Boolean(developer);
};

export const canManageDevelopers = async (kindeId: string) => {
  if (process.env.DEV_BOOTSTRAP_ID && kindeId === process.env.DEV_BOOTSTRAP_ID) {
    return true;
  }
  return isDeveloper(kindeId);
};

export const listDevelopers = async () =>
  prisma.developer.findMany({
    orderBy: { createdAt: "desc" },
  });

export const addDeveloper = async (kindeId: string) =>
  prisma.developer.upsert({
    where: { kindeId },
    create: { kindeId },
    update: {},
  });

export const removeDeveloper = async (kindeId: string) =>
  prisma.developer.delete({
    where: { kindeId },
  });
