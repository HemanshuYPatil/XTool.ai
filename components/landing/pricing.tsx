"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { CheckIcon, ZapIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const packs = [
  {
    name: "Starter",
    price: "$9",
    description: "Great for small batches of AI generation.",
    features: ["1,000 credits", "Email support", "Standard generation"],
    cta: "Buy Starter",
    popular: false,
  },
  {
    name: "Builder",
    price: "$29",
    description: "Best value for ongoing design work.",
    features: ["4,000 credits", "Priority generation", "Team sharing"],
    cta: "Buy Builder",
    popular: true,
  },
  {
    name: "Studio",
    price: "$99",
    description: "High-volume credits for product teams.",
    features: ["15,000 credits", "Fastest generation", "Dedicated support"],
    cta: "Buy Studio",
    popular: false,
  },
];

export const Pricing = () => {
  return (
    <section id="pricing" className="py-24 px-6 max-w-7xl mx-auto">
      <div className="text-center mb-16 space-y-4">
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
          Credit Packs
        </h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Buy credits and use them across XTool.ai AI workflows.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {packs.map((pack) => (
          <div
            key={pack.name}
            className={cn(
              "relative p-8 rounded-[2.5rem] border bg-card/40 backdrop-blur-sm flex flex-col transition-all duration-500",
              pack.popular ? "ring-2 ring-primary shadow-2xl shadow-primary/10 scale-105 z-10" : "hover:bg-card/60"
            )}
          >
            {pack.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">
                Most Popular
              </div>
            )}

            <div className="mb-8">
              <h3 className="text-xl font-bold mb-2">{pack.name}</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold">{pack.price}</span>
                <span className="text-muted-foreground">one-time</span>
              </div>
              <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                {pack.description}
              </p>
            </div>

            <ul className="space-y-4 mb-8 grow">
              {pack.features.map((feature) => (
                <li key={feature} className="flex items-center gap-3 text-sm">
                  <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <CheckIcon className="size-3 text-primary" />
                  </div>
                  <span className="text-foreground/80">{feature}</span>
                </li>
              ))}
            </ul>

            <Button
              className={cn(
                "w-full rounded-2xl h-12 text-sm font-bold transition-all duration-300",
                pack.popular ? "bg-primary shadow-lg shadow-primary/20 hover:opacity-90" : "bg-muted hover:bg-muted/80 text-foreground"
              )}
            >
              {pack.cta}
            </Button>
          </div>
        ))}
      </div>

      <div className="mt-16 text-center">
        <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
          <ZapIcon className="size-4 text-primary fill-current" />
          Credits power every AI experience in XTool.ai
        </p>
      </div>
    </section>
  );
};
