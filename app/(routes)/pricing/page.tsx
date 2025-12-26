import Link from "next/link";
import Header from "../_common/header";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { ensureUserFromKinde, getUserWithSubscription } from "@/lib/billing";
import { isDeveloper } from "@/lib/developers";

const plans = [
  {
    name: "Free",
    badge: "Starter",
    price: "$0",
    description: "Perfect for exploring ideas and building your first screens.",
    cta: { label: "Start for free", href: "/api/auth/login" },
    highlight: false,
    features: [
      "1 active project",
      "Standard themes and layouts",
      "Community support",
    ],
  },
  {
    name: "Xtreme",
    badge: "Pro",
    price: "$3",
    description: "Built for teams shipping polished UI at speed.",
    cta: { label: "Go Xtreme", href: "/api/checkout" },
    highlight: true,
    features: [
      "Unlimited projects and screens",
      "Premium themes and components",
      "Priority generation and exports",
    ],
  },
];

const comparisonRows = [
  {
    label: "Active projects",
    free: "1",
    xtreme: "Unlimited",
  },
  {
    label: "Design outputs",
    free: "Standard resolution exports",
    xtreme: "High-res exports and variations",
  },
  {
    label: "Themes and components",
    free: "Core set",
    xtreme: "Full premium library",
  },
  {
    label: "Brand kits",
    free: "Basic palette",
    xtreme: "Saved brand kits",
  },
  {
    label: "Support",
    free: "Community support",
    xtreme: "Priority support",
  },
  {
    label: "Commercial usage",
    free: "Personal only",
    xtreme: "Commercial license",
  },
];

const outputPreviews = [
  {
    title: "Free output",
    subtitle: "Solid layouts with standard export quality.",
    image: "/pricing/free.png",
  },
  {
    title: "Xtreme output",
    subtitle: "More depth, richer components, high-res export.",
    image: "/pricing/pro.png",
  },
];

const PricingPage = async () => {
  const session = await getKindeServerSession();
  const user = await session.getUser();
  if (user) {
    await ensureUserFromKinde(user);
  }
  const subscriptionData = user ? await getUserWithSubscription(user.id) : null;
  const developer = user ? await isDeveloper(user.id) : false;
  const planLabel = developer
    ? "Developer"
    : subscriptionData?.plan === "PRO"
    ? "Xtreme"
    : "Free";
  return (
    <div className="min-h-screen w-full bg-background">
      <Header />

      <section className="relative overflow-hidden pt-20 pb-12">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.15),_transparent_55%)]" />
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center space-y-4">
            <p className="text-xs uppercase tracking-[0.2em] text-primary">
              Pricing
            </p>
            <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight">
              Choose the plan that fits your pace
            </h1>
            <p className="text-foreground/80 max-w-2xl mx-auto text-base sm:text-lg">
              Compare features, see real output differences, and pick the plan
              that helps you ship faster.
            </p>
            {user ? (
              <div className="mt-6 inline-flex items-center justify-center gap-3 rounded-full border border-border/60 bg-background/80 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground shadow-sm">
                Current plan: <span className="text-foreground">{planLabel}</span>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="pb-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-6 md:grid-cols-2">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-3xl border p-8 shadow-sm ${
                  plan.highlight
                    ? "bg-primary/10 ring-1 ring-primary/40 relative overflow-hidden"
                    : "bg-card/70 backdrop-blur-xl"
                }`}
              >
                {plan.highlight && (
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent" />
                )}
                <div className="relative">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">{plan.name}</h2>
                    <span
                      className={`text-xs uppercase tracking-wide ${
                        plan.highlight ? "text-primary" : "text-muted-foreground"
                      }`}
                    >
                      {plan.badge}
                    </span>
                  </div>
                  {user && !developer ? (
                    <p className="mt-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      {plan.name === planLabel
                        ? "Your current plan"
                        : "Available plan"}
                    </p>
                  ) : null}
                  <div className="mt-6 flex items-end gap-2">
                    <span className="text-4xl font-semibold">{plan.price}</span>
                    <span className="text-sm text-muted-foreground">
                      /month
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">
                    {plan.description}
                  </p>
                  <ul className="mt-6 space-y-3 text-sm">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={plan.cta.href}
                    className={`mt-8 inline-flex w-full items-center justify-center rounded-full py-3 text-sm font-semibold transition ${
                      plan.highlight
                        ? "bg-primary text-primary-foreground shadow-md hover:shadow-lg"
                        : "border border-border hover:bg-muted/60"
                    }`}
                  >
                    {plan.cta.label}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 border-t border-border/60 bg-muted/20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col gap-3 text-center">
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">
              Side-by-side plan comparison
            </h2>
            <p className="text-foreground/80 max-w-2xl mx-auto">
              Every feature in one view so your team can pick confidently.
            </p>
          </div>

          <div className="mt-10 overflow-hidden rounded-3xl border bg-background">
            <div className="grid grid-cols-3 text-sm font-medium">
              <div className="px-6 py-4 text-muted-foreground">
                Feature
              </div>
              <div className="px-6 py-4 text-center">Free</div>
              <div className="px-6 py-4 text-center text-primary">Xtreme</div>
            </div>
            <div className="divide-y divide-border/60">
              {comparisonRows.map((row) => (
                <div key={row.label} className="grid grid-cols-3 text-sm">
                  <div className="px-6 py-4 text-muted-foreground">
                    {row.label}
                  </div>
                  <div className="px-6 py-4 text-center">{row.free}</div>
                  <div className="px-6 py-4 text-center font-medium">
                    {row.xtreme}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col gap-3 text-center">
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">
              Output comparison
            </h2>
            <p className="text-foreground/80 max-w-2xl mx-auto">
              See how the model output evolves from Free to Xtreme.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {outputPreviews.map((preview) => (
              <div
                key={preview.title}
                className="rounded-3xl border bg-card/70 p-6 shadow-sm"
              >
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">{preview.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {preview.subtitle}
                  </p>
                </div>
                <div className="mt-6 flex h-[420px] items-center justify-center overflow-hidden rounded-2xl border bg-muted/30 p-3">
                  <img
                    src={preview.image}
                    alt={`${preview.title} preview`}
                    className="max-h-full w-auto object-contain select-none"
                    draggable={false}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default PricingPage;
