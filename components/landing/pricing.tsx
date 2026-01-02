"use client";

import React from "react";
import Link from "next/link";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Starter",
    price: "$9",
    description: "Perfect for hobbyists.",
    features: ["450 credits", "Basic tools access", "Community support"],
  },
  {
    name: "Builder",
    price: "$29",
    popular: true,
    description: "For serious builders.",
    features: ["1,800 credits", "All tools access", "Priority support", "Export to React"],
  },
  {
    name: "Studio",
    price: "$99",
    description: "For professional teams.",
    features: ["7,200 credits", "Team collaboration", "Dedicated support", "API Access"],
  },
];

export const Pricing = () => {
  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Background Animation */}
      <div className="absolute inset-0 -z-10 bg-background">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[128px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[128px] animate-pulse delay-1000" />
      </div>

      <div className="container px-4 md:px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-muted-foreground">
            Choose the plan that fits your needs. No hidden fees.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-3xl border p-8 flex flex-col transition-all duration-300 hover:-translate-y-2 ${
                plan.popular
                  ? "bg-card/50 border-primary/50 shadow-2xl shadow-primary/10 scale-105 z-10 backdrop-blur-md"
                  : "bg-card/30 border-border hover:border-primary/30 backdrop-blur-sm"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-purple-600 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-lg">
                  Most Popular
                </div>
              )}
              <div className="mb-6">
                <h3 className="text-xl font-semibold">{plan.name}</h3>
                <div className="mt-2 flex items-baseline">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="ml-1 text-muted-foreground">/one-time</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {plan.description}
                </p>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center text-sm">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center mr-3">
                      <Check className="w-3 h-3 text-primary" />
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                href="/pricing"
                className={`w-full inline-flex items-center justify-center rounded-full py-3 text-sm font-semibold transition-all duration-300 ${
                  plan.popular
                    ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                Choose {plan.name}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
