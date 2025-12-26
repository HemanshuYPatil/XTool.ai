import crypto from "crypto";
import prisma from "@/lib/prisma";

const TOKEN_TTL_DAYS = 30;

export async function createCliToken(kindeId: string): Promise<string> {
  await prisma.cliToken.deleteMany({ where: { userId: kindeId } });

  const token = `cli_${crypto.randomBytes(24).toString("hex")}`;
  const expiresAt = new Date(Date.now() + TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);

  await prisma.cliToken.create({
    data: {
      token,
      userId: kindeId,
      expiresAt,
    },
  });

  return token;
}

export async function verifyCliToken(token: string) {
  const record = await prisma.cliToken.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!record) {
    return null;
  }

  if (record.expiresAt < new Date()) {
    return null;
  }

  await prisma.cliToken.update({
    where: { token },
    data: { lastUsedAt: new Date() },
  });

  return {
    id: record.userId,
    email: record.user?.email ?? null,
    name: record.user?.name ?? null,
  };
}
