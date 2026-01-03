export const POLAR_PLANS = {
  starter: {
    key: "starter",
    name: "Starter",
    credits: 450,
    priceId: "96357ed9-a61a-4555-b034-a2552b7b8132",
  },
  builder: {
    key: "builder",
    name: "Builder",
    credits: 1800,
    priceId: "09c07379-a31b-4ebb-831c-52e15c8ab40b",
  },
  studio: {
    key: "studio",
    name: "Studio",
    credits: 7200,
    priceId: "3577b27f-478d-48b3-8db4-8b6c85c5dc66",
  },
} as const;

export type PolarPlanKey = keyof typeof POLAR_PLANS;

export const getPlanByKey = (key?: string | null) => {
  if (!key) return null;
  return POLAR_PLANS[key as PolarPlanKey] ?? null;
};

export const getPlanByPriceId = (priceId?: string | null) => {
  if (!priceId) return null;
  const plan = Object.values(POLAR_PLANS).find(
    (entry) => entry.priceId === priceId
  );
  return plan ?? null;
};
