"use client";
import React from "react";
import Link from "next/link";
import Logo from "@/components/logo";

export const Footer = () => {
  return (
    <footer className="border-t bg-background py-12">
      <div className="container mx-auto px-4 flex flex-col items-center gap-6 text-center">
        <Logo />
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <Link href="/privacy" className="hover:text-primary transition-colors">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-primary transition-colors">
            Terms of Service
          </Link>
        </div>
        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} XTool.AI. All rights reserved.
        </p>
      </div>
    </footer>
  );
};
