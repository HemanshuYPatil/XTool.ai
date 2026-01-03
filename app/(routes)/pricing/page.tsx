"use client";

import React, { useEffect, useRef, useState } from "react";
import Header from "../_common/header";
import { Check, Sparkles } from "lucide-react";
import { gsap } from "gsap";

const packs = [
  {
    name: "Starter",
    key: "starter",
    price: "$9",
    credits: "450 credits",
    description: "Great for quick explorations and small batches.",
    features: ["450 AI Credits", "Basic Support", "Community Access"],
  },
  {
    name: "Builder",
    key: "builder",
    price: "$29",
    credits: "1,800 credits",
    description: "Ideal for regular design iterations.",
    highlight: true,
    features: ["1,800 AI Credits", "Priority Support", "Early Access Features", "Export Code"],
  },
  {
    name: "Studio",
    key: "studio",
    price: "$99",
    credits: "7,200 credits",
    description: "For teams running heavy AI workflows.",
    features: ["7,200 AI Credits", "Dedicated Support", "API Access", "Team Collaboration"],
  },
];

const PricingPage = () => {
  const headerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const startCheckout = async (planKey: string) => {
    setLoadingPlan(planKey);
    try {
      const response = await fetch("/api/polar/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planKey }),
      });

      if (response.status === 401) {
        const data = await response.json().catch(() => null);
        window.location.href = data?.loginUrl ?? "/api/auth/login";
        return;
      }

      if (!response.ok) {
        console.error("Failed to start checkout.");
        return;
      }

      const data = await response.json();
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Checkout error:", error);
    } finally {
      setLoadingPlan(null);
    }
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Initial states
      gsap.set(headerRef.current, { y: 50, opacity: 0 });
      gsap.set(cardsRef.current?.children || [], { y: 50, opacity: 0 });

      // Animations
      gsap.to(headerRef.current, {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: "power3.out",
        clearProps: "transform,opacity", // Ensure clean state after animation
      });

      gsap.to(cardsRef.current?.children || [], {
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.2,
        ease: "power3.out",
        delay: 0.3,
        clearProps: "transform,opacity",
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen w-full bg-background overflow-x-hidden">
      <Header />

      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
        
        <div ref={headerRef} className="container mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/50 border border-border backdrop-blur-sm mb-6">
             <Sparkles className="w-4 h-4 text-primary" />
             <span className="text-xs font-medium text-secondary-foreground">
               Simple & Transparent
             </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Choose your <span className="text-primary">Power Pack</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg mb-4">
            Buy credits and use them across XDesign AI generation. No monthly subscriptions, just pay as you go.
          </p>
           <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/70">
              ~750 tokens ≈ 15 credits per screen
            </p>
        </div>
      </section>

      <section className="pb-24">
        <div className="container mx-auto px-6">
          <div ref={cardsRef} className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
            {packs.map((pack) => (
              <div
                key={pack.name}
                className={`relative rounded-3xl border p-8 flex flex-col transition-all duration-300 hover:-translate-y-2 ${
                  pack.highlight
                    ? "bg-primary/5 border-primary/50 shadow-xl ring-1 ring-primary/20"
                    : "bg-card/50 backdrop-blur-sm border-border hover:border-primary/30 hover:shadow-lg"
                }`}
              >
                {pack.highlight && (
                   <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider shadow-lg">
                     Most Popular
                   </div>
                )}

                <div className="mb-6">
                  <h2 className="text-2xl font-bold mb-2">{pack.name}</h2>
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-bold tracking-tight">{pack.price}</span>
                    <span className="text-sm text-muted-foreground font-medium">/ one-time</span>
                  </div>
                  <p className="text-muted-foreground mt-4 text-sm">{pack.description}</p>
                </div>

                <div className="rounded-2xl bg-secondary/50 border border-border/50 p-4 mb-6 text-center">
                   <span className="font-bold text-foreground">{pack.credits}</span>
                </div>

                <ul className="space-y-4 mb-8 flex-1">
                   {pack.features?.map((feature, i) => (
                      <li key={i} className="flex items-center text-sm text-muted-foreground">
                         <Check className={`w-5 h-5 mr-3 ${pack.highlight ? "text-primary" : "text-muted-foreground"}`} />
                         {feature}
                      </li>
                   ))}
                </ul>

                <button
                  type="button"
                  onClick={() => startCheckout(pack.key)}
                  disabled={loadingPlan === pack.key}
                  className={`w-full inline-flex items-center justify-center rounded-full py-4 text-sm font-bold transition-all duration-300 ${
                    pack.highlight
                      ? "bg-primary text-primary-foreground shadow-lg hover:shadow-primary/25 hover:scale-[1.02]"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  } ${loadingPlan === pack.key ? "opacity-70 cursor-not-allowed" : ""}`}
                >
                  {loadingPlan === pack.key ? "Redirecting..." : "Get Started"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* FAQ Section Placeholder - Can be expanded later */}
      <section className="py-20 border-t border-border/50">
         <div className="container mx-auto px-6 text-center">
            <h2 className="text-2xl font-bold mb-8">Frequently Asked Questions</h2>
            <div className="max-w-3xl mx-auto grid gap-6 text-left">
               <div className="p-6 rounded-2xl bg-card border border-border">
                  <h3 className="font-semibold mb-2">Do credits expire?</h3>
                  <p className="text-muted-foreground text-sm">No, your credits never expire. You can use them whenever you need.</p>
               </div>
               <div className="p-6 rounded-2xl bg-card border border-border">
                  <h3 className="font-semibold mb-2">Can I upgrade later?</h3>
                  <p className="text-muted-foreground text-sm">Yes, you can purchase additional credit packs at any time.</p>
               </div>
            </div>
         </div>
      </section>
    </div>
  );
};

export default PricingPage;
