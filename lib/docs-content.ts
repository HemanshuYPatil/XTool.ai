export const docsContent = {
  introduction: {
    title: "Introduction",
    content: `
# Welcome to XTool.ai

XTool.ai is a comprehensive AI-powered workspace designed to streamline application development and content creation. It integrates multiple AI tools into a single platform, leveraging event-driven architecture and realtime data syncing for a seamless user experience.

## Our Vision
We aim to bridge the gap between idea and execution by providing intelligent tools that handle the heavy lifting of design, coding, and content creation.

## Key Features
- **XDesign**: AI-powered mobile app UI generator.
- **XCreator**: Content creation suite for images and videos.
- **Xcode CLI**: Integration with local development workflows.
- **Realtime Sync**: Powered by Convex for instant updates.
- **Event-Driven**: Powered by Inngest for heavy AI tasks.
    `
  },
  architecture: {
    title: "Architecture",
    content: `
# System Architecture

XTool.ai is built with a modern, scalable tech stack focused on performance and developer experience.

## Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Database**: Prisma (MongoDB)
- **Realtime**: Convex
- **Queue**: Inngest
- **AI**: OpenRouter (Claude, GPT-4, Llama)

## Authentication Flow
We use Kinde for secure, passwordless authentication. On every page load, we sync user profiles to Prisma and credits to Convex to ensure a consistent experience across the platform.

## Generation Workflow
Heavy AI tasks like UI generation are handled asynchronously via Inngest. This prevents request timeouts and allows us to stream progress back to you in realtime using Convex.
    `
  },
  modules: {
    title: "Modules",
    content: `
# Platform Modules

Explore the powerful tools available in the XTool.ai ecosystem.

## XDesign
The flagship module for generating high-fidelity mobile app UI mockups. Simply describe your app, and our AI will generate multi-screen designs with clean code. It supports:
- **Component Detection**: Automatically identifies buttons, inputs, and icons.
- **Realtime Editing**: Modify designs instantly with our dynamic sidebar.
- **Export to Code**: Get production-ready React Native or Flutter code.

## XCreator
A suite of tools for content creators, including:
- **Image Clipping**: Remove backgrounds and isolate subjects with high precision.
- **Video Clipping**: AI-powered video editing, highlights, and auto-captioning.
- **Scheduler**: Plan and automate your social media posts across multiple platforms.

## Xcode CLI
Bring the power of XTool.ai to your local terminal. Sync projects, generate code, and manage your workspace without leaving your IDE.
    `
  },
  pricing: {
    title: "Pricing",
    content: `
# Pricing Plans

Choose the plan that best fits your needs. All plans include access to our core AI features.

| Feature | Free | Pro | XTREME |
| :--- | :--- | :--- | :--- |
| Daily Credits | 10 | 100 | Unlimited |
| AI Models | Basic | Advanced | All Models |
| XDesign | Limited | Full Access | Priority |
| XCreator | Basic Tools | All Tools | Priority |
| Support | Community | Email | 24/7 Priority |
| Price | $0/mo | $29/mo | $99/mo |

## Credit Usage
Different tasks consume different amounts of credits:
- **UI Generation**: 5 credits per screen.
- **Image Clipping**: 1 credit per image.
- **Video Highlights**: 10 credits per minute.
    `
  },
  billing: {
    title: "Billing & Credits",
    content: `
# Billing & Credits

XTool.ai uses a credit-based system to provide flexible access to AI models.

## Credits
- **Usage**: Different AI tasks consume different amounts of credits based on the model complexity.
- **Realtime Balance**: Your credit balance is updated instantly across all devices.

## Plans
- **Free**: Get started with basic features and daily free credits.
- **Pro**: Unlock advanced models, higher generation limits, and priority support.
- **XTERME**: The ultimate plan with advanced UI tools and experimental AI capabilities.
    `
  }
};

export type DocSection = keyof typeof docsContent;
