"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PACKS = [
  { key: "starter", label: "Starter", price: "$9", credits: "450 credits" },
  { key: "builder", label: "Builder", price: "$29", credits: "1,800 credits" },
  { key: "studio", label: "Studio", price: "$99", credits: "7,200 credits" },
];

export const TopUpCard = () => {
  const [selected, setSelected] = useState(PACKS[0]?.key ?? "starter");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startCheckout = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const response = await fetch("/api/polar/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: selected }),
      });

      if (response.status === 401) {
        const data = await response.json().catch(() => null);
        window.location.href = data?.loginUrl ?? "/api/auth/login";
        return;
      }

      if (!response.ok) {
        setError("Unable to start checkout. Try again.");
        return;
      }

      const data = await response.json();
      if (data?.url) {
        window.location.href = data.url;
        return;
      }

      setError("Checkout unavailable. Try again.");
    } catch {
      setError("Checkout failed. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const selectedPack = PACKS.find((pack) => pack.key === selected);

  return (
    <div className="rounded-3xl border bg-card/40 p-6 shadow-sm space-y-4">
      <div className="space-y-1">
        <h2 className="text-base font-semibold">Top up credits</h2>
        <p className="text-xs text-muted-foreground">
          Purchase a credit pack in one click.
        </p>
      </div>

      <div className="rounded-2xl border bg-background p-4 space-y-3">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Pack</span>
          <span>{selectedPack?.credits}</span>
        </div>
        <Select value={selected} onValueChange={setSelected}>
          <SelectTrigger className="h-9 w-full rounded-md">
            <SelectValue placeholder="Choose a pack" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            {PACKS.map((pack) => (
              <SelectItem key={pack.key} value={pack.key}>
                {pack.label} · {pack.price}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button
        className="w-full rounded-full"
        onClick={startCheckout}
        disabled={isLoading}
      >
        {isLoading ? "Redirecting..." : "Pay & top up"}
      </Button>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
};
