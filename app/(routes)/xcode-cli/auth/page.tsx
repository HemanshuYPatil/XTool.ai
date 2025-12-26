import Link from "next/link";
import { redirect } from "next/navigation";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { createCliToken } from "@/lib/cli-auth";

export const dynamic = "force-dynamic";

export default async function CliAuthPage() {
  const session = await getKindeServerSession();
  const user = await session.getUser();

  if (!user) {
    redirect("/api/auth/login");
  }

  const token = await createCliToken(user.id);

  return (
    <div className="min-h-screen w-full bg-background">
      <div className="mx-auto max-w-3xl px-6 pt-24 pb-16">
        <div className="rounded-3xl border bg-card/70 p-8 shadow-sm text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-primary">
            Xcode CLI
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">
            Authenticate your CLI
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Paste this one-time token into the CLI to finish linking your account.
          </p>

          <div className="mt-6 rounded-2xl border border-border/70 bg-background px-4 py-4">
            <code className="break-all text-sm font-semibold text-foreground">
              {token}
            </code>
          </div>

          <p className="mt-6 text-xs text-muted-foreground">
            Tip: keep this tab open while you paste the token.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/xcode-cli"
              className="inline-flex items-center justify-center rounded-full border border-border px-5 py-2 text-sm font-semibold transition hover:bg-muted/60"
            >
              Back to Xcode CLI
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
            >
              Go to dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
