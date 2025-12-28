import Link from "next/link";
import Header from "../_common/header";

const packs = [
  {
    name: "Starter",
    price: "$9",
    credits: "1,000 credits",
    description: "For quick explorations and small batches.",
  },
  {
    name: "Builder",
    price: "$29",
    credits: "4,000 credits",
    description: "Ideal for regular design iterations.",
    highlight: true,
  },
  {
    name: "Studio",
    price: "$99",
    credits: "15,000 credits",
    description: "For teams running heavy AI workflows.",
  },
];

const PricingPage = async () => {
  return (
    <div className="min-h-screen w-full bg-background">
      <Header />

      <section className="relative overflow-hidden pt-20 pb-12">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.15),_transparent_55%)]" />
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center space-y-4">
            <p className="text-xs uppercase tracking-[0.2em] text-primary">
              Credits
            </p>
            <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight">
              Choose a credit pack
            </h1>
            <p className="text-foreground/80 max-w-2xl mx-auto text-base sm:text-lg">
              Buy credits and use them across XDesign AI generation.
            </p>
          </div>
        </div>
      </section>

      <section className="pb-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-6 md:grid-cols-3">
            {packs.map((pack) => (
              <div
                key={pack.name}
                className={`rounded-3xl border p-8 shadow-sm ${
                  pack.highlight
                    ? "bg-primary/10 ring-1 ring-primary/40 relative overflow-hidden"
                    : "bg-card/70 backdrop-blur-xl"
                }`}
              >
                <div className="relative space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">{pack.name}</h2>
                    {pack.highlight ? (
                      <span className="text-xs uppercase tracking-wide text-primary">
                        Popular
                      </span>
                    ) : null}
                  </div>
                  <div className="flex items-end gap-2">
                    <span className="text-4xl font-semibold">{pack.price}</span>
                    <span className="text-sm text-muted-foreground">one-time</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{pack.description}</p>
                  <div className="rounded-2xl border bg-background/60 px-4 py-3 text-sm font-semibold">
                    {pack.credits}
                  </div>
                  <Link
                    href="/billing"
                    className={`mt-4 inline-flex w-full items-center justify-center rounded-full py-3 text-sm font-semibold transition ${
                      pack.highlight
                        ? "bg-primary text-primary-foreground shadow-md hover:shadow-lg"
                        : "border border-border hover:bg-muted/60"
                    }`}
                  >
                    Buy credits
                  </Link>
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
