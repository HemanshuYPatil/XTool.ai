import prisma from "@/lib/prisma";

export type UsageTimeframe = "daily" | "monthly" | "yearly";

export type UsagePoint = {
  label: string;
  value: number;
};

export type ModuleUsageSeries = {
  daily: UsagePoint[];
  monthly: UsagePoint[];
  yearly: UsagePoint[];
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const startOfDay = (date: Date) => {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
};

const startOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);

const startOfYear = (date: Date) => new Date(date.getFullYear(), 0, 1);

const buildDailyBuckets = (now: Date) => {
  const buckets: { label: string; start: Date; end: Date }[] = [];
  for (let i = 6; i >= 0; i -= 1) {
    const day = new Date(now.getTime() - i * MS_PER_DAY);
    const start = startOfDay(day);
    const end = new Date(start.getTime() + MS_PER_DAY);
    const label = day.toLocaleDateString("en-US", { weekday: "short" });
    buckets.push({ label, start, end });
  }
  return buckets;
};

const buildMonthlyBuckets = (now: Date) => {
  const buckets: { label: string; start: Date; end: Date }[] = [];
  for (let i = 11; i >= 0; i -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const start = startOfMonth(date);
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 1);
    const label = date.toLocaleDateString("en-US", { month: "short" });
    buckets.push({ label, start, end });
  }
  return buckets;
};

const buildYearlyBuckets = (now: Date) => {
  const buckets: { label: string; start: Date; end: Date }[] = [];
  for (let i = 3; i >= 0; i -= 1) {
    const year = now.getFullYear() - i;
    const start = startOfYear(new Date(year, 0, 1));
    const end = startOfYear(new Date(year + 1, 0, 1));
    buckets.push({ label: String(year), start, end });
  }
  return buckets;
};

const aggregateUsage = (
  buckets: { label: string; start: Date; end: Date }[],
  events: { usedAt: Date; units: number }[],
) => {
  const counts = new Array(buckets.length).fill(0);
  for (const event of events) {
    const usedAt = new Date(event.usedAt);
    for (let i = 0; i < buckets.length; i += 1) {
      const bucket = buckets[i];
      if (usedAt >= bucket.start && usedAt < bucket.end) {
        counts[i] += event.units;
        break;
      }
    }
  }
  return buckets.map((bucket, index) => ({
    label: bucket.label,
    value: counts[index],
  }));
};

export const recordModuleUsage = async ({
  userId,
  module,
  units = 1,
  usedAt,
}: {
  userId: string;
  module: "XDESIGN" | "XCODE" | "XCREATOR" | "XTOOL";
  units?: number;
  usedAt?: Date;
}) => {
  return prisma.moduleUsageEvent.create({
    data: {
      userId,
      module,
      units,
      usedAt: usedAt ?? new Date(),
    },
  });
};

export const getModuleUsageSeries = async ({
  userId,
  module,
  now = new Date(),
}: {
  userId: string;
  module: "XDESIGN" | "XCODE" | "XCREATOR" | "XTOOL";
  now?: Date;
}): Promise<ModuleUsageSeries> => {
  const dailyBuckets = buildDailyBuckets(now);
  const monthlyBuckets = buildMonthlyBuckets(now);
  const yearlyBuckets = buildYearlyBuckets(now);
  const earliest = yearlyBuckets[0]?.start ?? startOfYear(now);

  const events = await prisma.moduleUsageEvent.findMany({
    where: {
      userId,
      module,
      usedAt: {
        gte: earliest,
      },
    },
    select: {
      usedAt: true,
      units: true,
    },
  });

  return {
    daily: aggregateUsage(dailyBuckets, events),
    monthly: aggregateUsage(monthlyBuckets, events),
    yearly: aggregateUsage(yearlyBuckets, events),
  };
};
