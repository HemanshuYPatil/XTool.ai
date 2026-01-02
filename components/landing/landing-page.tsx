"use client";

import { Hero } from "./hero";
import { Services } from "./services";
import { ToolsShowcase } from "./tools-showcase";
import { Pricing } from "./pricing";
import { Footer } from "./footer";
import Header from "@/app/(routes)/_common/header";

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Header />
      <main>
        <Hero />
        <Services />
        <ToolsShowcase />
        <Pricing />
      </main>
      <Footer />
    </div>
  );
};
