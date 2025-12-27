"use client";
import React from "react";
import Link from "next/link";
import Logo from "@/components/logo";
import { GithubIcon, TwitterIcon, YoutubeIcon, InstagramIcon } from "lucide-react";

const footerLinks = [
  {
    title: "Product",
    links: [
      { name: "XCreator", href: "/xtool/module-xcreator" },
      { name: "XCode", href: "/xtool/module-xcode" },
      { name: "XDesign", href: "/xtool/module-xdesign" },
      { name: "Pricing", href: "#pricing" }
    ]
  },
  {
    title: "Resources",
    links: [
      { name: "Documentation", href: "#" },
      { name: "Blog", href: "#" },
      { name: "Community", href: "#" },
      { name: "Support", href: "#" }
    ]
  },
  {
    title: "Legal",
    links: [
      { name: "Privacy Policy", href: "#" },
      { name: "Terms of Service", href: "#" },
      { name: "Cookie Policy", href: "#" }
    ]
  }
];

export const Footer = () => {
  return (
    <footer className="border-t bg-card/20 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-12 mb-16">
          <div className="col-span-2 space-y-6">
            <Logo />
            <p className="text-muted-foreground text-sm max-w-xs leading-relaxed">
              The all-in-one command center for modern creators and developers. 
              Automate your workflow and build the future with AI.
            </p>
            <div className="flex items-center gap-4">
              {[TwitterIcon, GithubIcon, YoutubeIcon, InstagramIcon].map((Icon, i) => (
                <Link key={i} href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  <Icon className="size-5" />
                </Link>
              ))}
            </div>
          </div>

          {footerLinks.map((section) => (
            <div key={section.title} className="space-y-6">
              <h4 className="text-sm font-bold uppercase tracking-widest">{section.title}</h4>
              <ul className="space-y-4">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} XTool.ai. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="#" className="text-xs text-muted-foreground hover:text-primary transition-colors">Status</Link>
            <Link href="#" className="text-xs text-muted-foreground hover:text-primary transition-colors">Security</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
