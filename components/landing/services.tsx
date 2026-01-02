"use client";

import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Layout, Code, Zap, Layers } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const services = [
  {
    icon: <Layout className="w-6 h-6" />,
    title: "UI/UX Design",
    description:
      "Create stunning interfaces with our advanced design tools. Drag, drop, and customize with ease.",
  },
  {
    icon: <Code className="w-6 h-6" />,
    title: "Code Generation",
    description:
      "Export production-ready code in React, Vue, or HTML/CSS. Clean, maintainable, and optimized.",
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: "Rapid Prototyping",
    description:
      "Go from idea to interactive prototype in minutes. Test your concepts before writing a single line of code.",
  },
  {
    icon: <Layers className="w-6 h-6" />,
    title: "Component Library",
    description:
      "Access a vast library of pre-built components. Customize them to fit your brand identity perfectly.",
  },
];

export const Services = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(cardsRef.current?.children || [], {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
        },
        y: 50,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: "power3.out",
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="py-24 bg-background relative overflow-hidden"
    >
      <div className="container px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
            Everything you need to build
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            A comprehensive suite of tools designed to empower developers and
            designers.
          </p>
        </div>

        <div
          ref={cardsRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {services.map((service, index) => (
            <div
              key={index}
              className="group p-6 rounded-2xl border border-border bg-card hover:bg-accent/5 transition-colors duration-300"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform duration-300">
                {service.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
              <p className="text-muted-foreground text-sm">
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
