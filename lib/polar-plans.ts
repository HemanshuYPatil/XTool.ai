export const POLAR_PLANS = {
  starter: {
    key: "starter",
    name: "Starter",
    credits: 450,
    priceId: "309a181f-073b-466d-ae6e-387cf791b5d1",
  },
  builder: {
    key: "builder",
    name: "Builder",
    credits: 1800,
    priceId: "b44c6ba1-add4-42fb-9459-2d349042f859",
  },
  studio: {
    key: "studio",
    name: "Studio",
    credits: 7200,
    priceId: "53f2455d-e87f-4157-9d88-1f0d5f4fec26",
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
