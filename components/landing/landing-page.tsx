"use client";
import React from "react";
import { Hero } from "./hero";
import { ModuleCards } from "./module-cards";
import { Pricing } from "./pricing";
import { Footer } from "./footer";
import Header from "@/app/(routes)/_common/header";

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      <Header />
      <main>
        <Hero />
        <ModuleCards />
        
        {/* Feature Highlight Section (Optional but good for depth) */}
        <section className="py-24 px-6 bg-primary/5 border-y">
          <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
                Built for the Next Generation of Creators
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                XTool.ai isn't just another tool. It's an ecosystem designed to handle the heavy lifting of content creation, coding, and design, so you can focus on what matters most: your vision.
              </p>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h4 className="text-2xl font-bold text-primary">10x</h4>
                  <p className="text-sm text-muted-foreground">Faster content delivery</p>
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-primary">50+</h4>
                  <p className="text-sm text-muted-foreground">AI-powered tools</p>
                </div>
              </div>
            </div>
            <div className="relative aspect-video rounded-3xl overflow-hidden border shadow-2xl">
              <div className="absolute inset-0 bg-linear-to-br from-primary/20 to-purple-500/20 z-10" />
              <img 
                src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop" 
                alt="AI Creation" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </section>

        <Pricing />

        {/* Final CTA */}
        <section className="py-24 px-6">
          <div className="max-w-4xl mx-auto rounded-[3rem] bg-linear-to-br from-primary via-purple-600 to-blue-600 p-12 text-center text-white shadow-2xl shadow-primary/20">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to transform your workflow?</h2>
            <p className="text-lg opacity-90 mb-10 max-w-xl mx-auto">
              Join thousands of creators and developers building the future with XTool.ai. Start your journey today.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button className="px-8 h-14 rounded-full bg-white text-primary font-bold hover:bg-opacity-90 transition-all">
                Get Started for Free
              </button>
              <button className="px-8 h-14 rounded-full bg-white/10 backdrop-blur-md border border-white/20 font-bold hover:bg-white/20 transition-all">
                Contact Sales
              </button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};
