import Header from "./_common/header";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { isDeveloper } from "@/lib/developers";
import ModulesBrowser from "@/components/dashboard/modules-browser";

const modules = [
  {
    name: "X Design",
    description: "Design UI screens with your AI mobile agent.",
    status: "Active",
    href: "/xdesign",
  },
  {
    name: "X-code CLI",
    description:
      "Agentic CLI coding partner with OpenRouter-ready model routing.",
    status: "Beta",
    href: "/xcode-cli",
  },
  {
    name: "X Creator",
    description:
      "Creator dashboard to connect channels, plan content, and grow revenue.",
    status: "Active",
    href: "/xcreator",
  },
  {
    name: "X Chat",
    description: "Ask questions and explore your data with AI.",
    status: "Coming soon",
  },
  {
    name: "X Knowledge",
    description: "Turn docs into answers and workflows.",
    status: "Coming soon",
  },
  {
    name: "X Automate",
    description: "Connect tools, trigger actions, and scale workflows.",
    status: "Coming soon",
  },
];

export default async function Home() {
  const session = await getKindeServerSession();
  const user = await session.getUser();
  const initialIsDeveloper = user ? await isDeveloper(user.id) : false;

  return (
    <div className="min-h-screen w-full bg-background">
      <Header initialUser={user ?? undefined} />

      <section className="pt-16 pb-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="space-y-6">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.2em] text-primary">
                Workspace
              </p>
              <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
                The AI workspace for building product experiences
              </h1>
              <p className="text-foreground/80 max-w-2xl">
                XTool.ai helps you design and ship digital experiences. Start
                with AI-powered UI design, then expand to chat, knowledge, and
                automation as your team grows.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                href="/xdesign"
                className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2 text-xs font-semibold uppercase tracking-wide text-primary-foreground transition hover:opacity-90"
              >
                Open X Design
              </a>
              <a
                href="/explore"
                className="inline-flex items-center justify-center rounded-full border border-border px-5 py-2 text-xs font-semibold uppercase tracking-wide text-foreground transition hover:bg-muted/60"
              >
                Explore examples
              </a>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-3xl border bg-muted/20 p-6">
                <h3 className="text-lg font-semibold tracking-tight">
                  What you can do today
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Create polished UI screens with an AI mobile agent and hand
                  off production-ready layouts.
                </p>
              </div>
              <div className="rounded-3xl border bg-background/70 p-6">
                <h3 className="text-lg font-semibold tracking-tight">
                  What is coming next
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Ask questions, turn docs into workflows, and automate actions
                  across your stack.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-16">
        <div className="mx-auto max-w-6xl px-6">
          <ModulesBrowser
            modules={modules}
            isDeveloper={initialIsDeveloper}
          />
        </div>
      </section>

      <section className="pb-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="rounded-3xl border bg-muted/20 p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-3">
                <p className="text-xs uppercase tracking-[0.2em] text-primary">
                  XTool.ai suite
                </p>
                <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
                  A clean, unified platform for modern teams
                </h2>
                <p className="text-sm text-muted-foreground max-w-2xl">
                  Keep tools connected with consistent UX, security, and
                  analytics so your team ships faster and stays aligned.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                {[
                  "Enterprise-ready",
                  "Unified permissions",
                  "Shared components",
                  "Secure by default",
                ].map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-border/60 bg-background px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
