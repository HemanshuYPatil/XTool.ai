"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const STORAGE_KEY = "xdesign-cookie-consent";

const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    setIsVisible(stored !== "accepted" && stored !== "declined");
  }, []);

  const handleConsent = (value: "accepted" | "declined") => {
    window.localStorage.setItem(STORAGE_KEY, value);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border/60 bg-background/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">We use cookies</p>
          <p>
            We use essential cookies to keep XTool.ai running smoothly and
            optional cookies to improve your experience. Read our{" "}
            <Link href="/privacy" className="underline underline-offset-4">
              privacy policy
            </Link>
            .
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <button
            type="button"
            onClick={() => handleConsent("declined")}
            className="inline-flex items-center justify-center rounded-full border border-border px-5 py-2 text-xs font-semibold uppercase tracking-wide text-foreground transition hover:bg-muted/60"
          >
            Decline
          </button>
          <button
            type="button"
            onClick={() => handleConsent("accepted")}
            className="inline-flex items-center justify-center rounded-full bg-foreground px-5 py-2 text-xs font-semibold uppercase tracking-wide text-background transition hover:opacity-90"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
