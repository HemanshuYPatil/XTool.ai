"use client";
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { 
  VideoIcon, 
  Code2Icon, 
  PaletteIcon, 
  ArrowUpRightIcon,
  SparklesIcon,
  TerminalIcon,
  LayersIcon
} from "lucide-react";

const modules = [
  {
    title: "XCreator",
    description: "AI-powered social media command center. Transform long-form videos into viral clips, schedule posts, and track engagement.",
    icon: VideoIcon,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    href: "/xtool/module-xcreator",
    features: ["AI Video Clipping", "Smart Scheduler", "Analytics Dashboard"]
  },
  {
    title: "XCode",
    description: "Advanced developer tools and CLI. Generate boilerplate, manage projects, and automate repetitive coding tasks with AI.",
    icon: Code2Icon,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    href: "/xtool/module-xcode",
    features: ["XCode CLI", "Code Generation", "Project Templates"]
  },
  {
    title: "XDesign",
    description: "Design stunning mobile app UIs in minutes. Chat with AI to generate mockups, iterate on designs, and export assets.",
    icon: PaletteIcon,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    href: "/xtool/module-xdesign",
    features: ["AI UI Generation", "Interactive Mockups", "Design Systems"]
  }
];

export const ModuleCards = () => {
  return (
    <section id="modules" className="py-24 px-6 max-w-7xl mx-auto">
      <div className="text-center mb-16 space-y-4">
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
          Powerful Modules for Every Need
        </h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Choose the right tool for your workflow. Each module is built to integrate seamlessly and boost your productivity.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {modules.map((module) => (
          <Card 
            key={module.title}
            className="group relative p-8 rounded-4xl border bg-card/40 backdrop-blur-sm hover:bg-card/60 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5 overflow-hidden"
          >
            {/* Decorative Background Icon */}
            <module.icon className="absolute -right-8 -bottom-8 size-48 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity duration-500" />

            <div className="relative z-10 space-y-6">
              <div className={`h-14 w-14 rounded-2xl ${module.bg} flex items-center justify-center`}>
                <module.icon className={`size-7 ${module.color}`} />
              </div>

              <div className="space-y-3">
                <h3 className="text-2xl font-bold">{module.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {module.description}
                </p>
              </div>

              <ul className="space-y-3 pt-2">
                {module.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm font-medium text-foreground/80">
                    <SparklesIcon className="size-3 text-primary" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button asChild variant="ghost" className="w-full justify-between rounded-xl h-12 px-6 group/btn hover:bg-primary/10 hover:text-primary">
                <Link href={module.href}>
                  Launch Module <ArrowUpRightIcon className="size-4 transition-transform group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1" />
                </Link>
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
};
