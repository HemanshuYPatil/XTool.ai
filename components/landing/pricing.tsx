"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { CheckIcon, ZapIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Free",
    price: "$0",
    description: "Perfect for exploring XTool's capabilities.",
    features: [
      "1 Project per day",
      "Basic AI generation",
      "Standard support",
      "Community access"
    ],
    cta: "Get Started",
    popular: false
  },
  {
    name: "Pro",
    price: "$19",
    description: "For creators who need more power and speed.",
    features: [
      "10 Projects per day",
      "Priority AI generation",
      "Advanced Video Clipping",
      "Email support",
      "Custom templates"
    ],
    cta: "Upgrade to Pro",
    popular: true
  },
  {
    name: "Xtreme",
    price: "$49",
    description: "The ultimate command center for professionals.",
    features: [
      "Unlimited Projects",
      "Fastest AI generation",
      "Full API Access",
      "Dedicated account manager",
      "White-label options",
      "Team collaboration"
    ],
    cta: "Go Xtreme",
    popular: false
  }
];

export const Pricing = () => {
  return (
    <section id="pricing" className="py-24 px-6 max-w-7xl mx-auto">
      <div className="text-center mb-16 space-y-4">
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
          Simple, Transparent Pricing
        </h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Choose the plan that fits your growth. No hidden fees, cancel anytime.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <div 
            key={plan.name}
            className={cn(
              "relative p-8 rounded-[2.5rem] border bg-card/40 backdrop-blur-sm flex flex-col transition-all duration-500",
              plan.popular ? "ring-2 ring-primary shadow-2xl shadow-primary/10 scale-105 z-10" : "hover:bg-card/60"
            )}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">
                Most Popular
              </div>
            )}

            <div className="mb-8">
              <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground">/mo</span>
              </div>
              <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                {plan.description}
              </p>
            </div>

            <ul className="space-y-4 mb-8 flex-grow">
              {plan.features.map((feature) => (
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
                plan.popular ? "bg-primary shadow-lg shadow-primary/20 hover:opacity-90" : "bg-muted hover:bg-muted/80 text-foreground"
              )}
            >
              {plan.cta}
            </Button>
          </div>
        ))}
      </div>

      <div className="mt-16 text-center">
        <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
          <ZapIcon className="size-4 text-primary fill-current" />
          Join 10,000+ creators building the future with XTool.ai
        </p>
      </div>
    </section>
  );
};
