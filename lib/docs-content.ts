export const docsContent = {
  about: {
    title: "About Us",
    content: `
# About Us

XTool.ai is a unified workspace for building, refining, and presenting digital work in one place. We help teams and solo creators move from raw ideas to polished outputs with clarity, speed, and consistent quality. The platform brings together design, content, and project management so you can focus on the story you want to tell instead of juggling scattered tools.

## Platform Overview
XTool.ai is built to support the full creative lifecycle: planning, ideation, drafting, review, and delivery. It gives you a reliable home for your assets, a clear view of what is being produced, and a straightforward way to keep work aligned across teams. Whether you are exploring new product concepts, preparing marketing assets, or organizing a client project, XTool.ai keeps the work structured and easy to access.

## What You Can Do
- Create and refine multi-screen design concepts without starting from a blank canvas.
- Build visual and media assets that match your brand and content goals.
- Organize projects, versions, and deliverables in a consistent workspace.
- Keep collaboration readable and orderly with shared views and updates.
- Revisit and improve past work without losing context or quality.
- Present results to clients or stakeholders in a clean, professional format.
- Track usage and plan resources without surprising constraints.
- Move between creative and operational work without switching platforms.

## Active Modules
- **XDesign Studio**: A focused space for generating and refining interface ideas, layouts, and screen sets with strong visual consistency.
- **XCreator**: A creative studio for imagery and media content, supporting polished outputs that align with your project narrative.
- **Xcode CLI**: A text-first workspace for power users who prefer fast, command-driven interactions and compact workflows.
- **Projects**: Your central library for organizing initiatives, storing drafts, and maintaining clear ownership of each deliverable.
- **Explore**: A discovery space where you can review public showcases and find inspiration across different styles and use cases.
- **Documentation & Help**: The knowledge hub that explains the platform, answers questions, and keeps teams aligned.
- **Billing & Account**: A dedicated area to manage plans, credits, and profile preferences with full visibility.

## Credit System
XTool.ai uses a credit system to keep usage flexible and predictable. Credits are applied when you run AI-powered actions, giving you clear control over consumption while you work. Your available balance is always visible, and you can choose the plan or top-up option that fits your pace of creation.

- Credits are designed to scale with how much you create, not lock you into a fixed workflow.
- You can review usage before starting larger actions to keep your budget on track.
- Teams can align usage expectations across members with shared visibility.
- The system makes it easy to plan ahead, whether you work occasionally or at high volume.

## Who We Serve
XTool.ai is made for product teams, creative studios, founders, marketers, and independent creators who want a single, dependable workspace. It is equally suited for early exploration and for producing client-ready results when time and quality both matter.

## Our Commitment
We prioritize simplicity without sacrificing depth. The platform is designed to feel professional and comfortable to use, while still offering enough structure to support serious work. If you ever need help, our documentation and support resources are built to guide you without overwhelming you.
    `
  },
  "getting-started": {
    title: "Getting Started",
    content: `
# Getting Started

This section gives a clear, minimal entry point to XTool.ai so you can begin with confidence.

## Quick Start
- Sign in and choose the workspace that fits your role.
- Review the main areas so you know where to start your work.
- Create a small test project to get familiar with the flow.

## First Milestones
- Define a simple goal for your first session.
- Keep your scope small and focus on a single outcome.
- Save your progress so you can return later without losing context.
    `
  },
  "workspace-basics": {
    title: "Workspace Basics",
    content: `
# Workspace Basics

Your workspace is where all activity lives. It is organized to stay clean and easy to scan.

## Core Areas
- The main canvas is where active work happens.
- Side panels keep guidance, notes, and actions within reach.
- The top bar gives quick access to your most important tasks.

## Best Practices
- Keep your workspace tidy by naming items clearly.
- Use consistent labels to stay organized across projects.
- Review your recent items to pick up where you left off.
    `
  },
  "projects-organization": {
    title: "Projects & Organization",
    content: `
# Projects & Organization

Projects help you group related work, keep context together, and stay accountable.

## Project Structure
- Use projects for distinct initiatives or clients.
- Add clear titles and short descriptions for quick scanning.
- Keep related files and outputs in one place.

## Staying Organized
- Archive or close work that is complete.
- Maintain consistent naming so teams stay aligned.
- Review your project list regularly to keep it focused.
    `
  },
  collaboration: {
    title: "Collaboration",
    content: `
# Collaboration

Collaboration is designed to be clear and respectful of each contributor.

## Shared Work
- Invite teammates with clear roles and expectations.
- Keep updates brief and focused on outcomes.
- Use shared views to align on progress.

## Team Habits
- Agree on naming and labeling to avoid confusion.
- Document key decisions where everyone can find them.
- Keep feedback actionable and concise.
    `
  },
  "reviews-feedback": {
    title: "Reviews & Feedback",
    content: `
# Reviews & Feedback

Review cycles are most effective when they are short, focused, and easy to track.

## Review Guidelines
- Keep notes specific and tied to the goal.
- Use clear priorities so teams know what matters most.
- Confirm when feedback has been addressed.

## Approval Readiness
- Check for clarity, consistency, and completeness.
- Make sure the work matches the intended audience.
- Record final status so there is no ambiguity.
    `
  },
  "sharing-presentation": {
    title: "Sharing & Presentation",
    content: `
# Sharing & Presentation

Presenting work should feel polished without extra effort.

## Sharing Principles
- Share only what is necessary for the audience.
- Provide a short context so viewers understand the goal.
- Keep links and references up to date.

## Presentation Tips
- Use clear titles and short summaries.
- Remove distractions that do not support the story.
- Review the final view before sending.
    `
  },
  "account-profile": {
    title: "Account & Profile",
    content: `
# Account & Profile

Your profile keeps your identity and workspace preferences consistent.

## Profile Basics
- Add a clear name and role for recognition.
- Keep your contact details current.
- Update your preferences as your work changes.

## Personal Settings
- Choose the default workspace you use most.
- Keep notifications aligned with your focus.
- Review your settings periodically for accuracy.
    `
  },
  "billing-credits": {
    title: "Billing & Credits",
    content: `
# Billing & Credits

Billing is designed to be transparent, with visibility into your usage and plan.

## Managing Credits
- Track your balance before starting larger work.
- Use credits intentionally for high-impact tasks.
- Keep an eye on usage to avoid surprises.

## Plan Oversight
- Review your plan details anytime.
- Update billing information when needed.
- Keep invoices and records for reference.
    `
  },
  "privacy-security": {
    title: "Privacy & Security",
    content: `
# Privacy & Security

We keep privacy and security simple to understand without extra complexity.

## Privacy Principles
- Your work stays in your workspace.
- You control who can access shared items.
- We keep visibility clear and intentional.

## Safety Practices
- Use strong account credentials.
- Review access if team membership changes.
- Report any concerns through support.
    `
  },
  support: {
    title: "Support",
    content: `
# Support

If you need help, support resources are available and easy to access.

## When You Need Help
- Start with the most relevant doc section.
- Use clear questions so we can respond quickly.
- Share context so the answer is accurate.

## Ongoing Guidance
- Check updates to stay current.
- Save links to frequently used guidance.
- Reach out when something is unclear.
    `
  }
};

export type DocSection = keyof typeof docsContent;
