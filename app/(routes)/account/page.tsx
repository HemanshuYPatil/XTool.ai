import Header from "../_common/header";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import prisma from "@/lib/prisma";
import { ensureUserFromKinde, getUserWithSubscription } from "@/lib/billing";

const AccountPage = async () => {
  const { getUser, getClaim } = getKindeServerSession();
  const [user, passwordClaim, mfaClaim] = await Promise.all([
    getUser(),
    getClaim("pwd_changed_at", "id_token"),
    getClaim("mfa_enabled", "id_token"),
  ]);
  if (user) {
    await ensureUserFromKinde(user);
  }
  const subscriptionData = user ? await getUserWithSubscription(user.id) : null;
  const projectCount = user
    ? await prisma.project.count({ where: { userId: user.id } })
    : 0;
  const fullName = [user?.given_name, user?.family_name]
    .filter(Boolean)
    .join(" ");
  const initials = `${user?.given_name?.charAt(0) ?? ""}${
    user?.family_name?.charAt(0) ?? ""
  }`.trim();
  const fallbackName = initials || "Not set";
  const emailDomain = user?.email?.split("@")[1] ?? "";
  const workspaceLabel = emailDomain
    ? `${emailDomain.split(".")[0]} workspace`
    : "Personal workspace";
  const passwordChangedAt =
    typeof passwordClaim?.value === "string" ? passwordClaim.value : "";
  const mfaRaw = typeof mfaClaim?.value === "string" ? mfaClaim.value : "";
  const mfaStatus = (() => {
    const normalized = mfaRaw.trim().toLowerCase();
    if (!normalized) return "Not available";
    if (["true", "1", "enabled", "yes"].includes(normalized)) return "Enabled";
    if (["false", "0", "disabled", "no"].includes(normalized))
      return "Disabled";
    return "Not available";
  })();
  const passwordLabel = (() => {
    if (!passwordChangedAt) return "Not available";
    const numeric = Number(passwordChangedAt);
    let date: Date | null = null;
    if (!Number.isNaN(numeric)) {
      const ms = numeric > 1_000_000_000_000 ? numeric : numeric * 1000;
      date = new Date(ms);
    } else {
      const parsed = Date.parse(passwordChangedAt);
      if (!Number.isNaN(parsed)) date = new Date(parsed);
    }
    if (!date || Number.isNaN(date.getTime())) return "Not available";
    const diffMs = Date.now() - date.getTime();
    const days = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
    if (days === 0) return "Today";
    return `${days} day${days === 1 ? "" : "s"} ago`;
  })();
  const planLabel =
    subscriptionData?.plan === "PRO" ? "Xtreme" : "Free";
  const seatsLabel = subscriptionData?.subscription?.seats
    ? `${subscriptionData.subscription.seats} seat${
        subscriptionData.subscription.seats === 1 ? "" : "s"
      }`
    : "1 seat";

  return (
    <div className="min-h-screen w-full bg-background">
      <Header />

      <section className="pt-16 pb-10">
        <div className="mx-auto max-w-6xl px-6">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.2em] text-primary">
              Account
            </p>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
              Manage your profile and workspace
            </h1>
            <p className="text-foreground/80 max-w-2xl">
              Keep your details, preferences, and team visibility aligned with
              how you build in XDesign.
            </p>
          </div>
        </div>
      </section>

      <section className="pb-16">
        <div className="mx-auto max-w-6xl px-6 grid gap-6 lg:grid-cols-3">
          <div className="rounded-3xl border bg-card/70 p-6 shadow-sm lg:col-span-2">
            <h2 className="text-lg font-semibold">Profile details</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Update your name, role, and contact information.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-border/60 p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Full name
                </p>
                <p className="mt-2 text-sm font-medium">
                  {fullName || fallbackName}
                </p>
              </div>
              <div className="rounded-2xl border border-border/60 p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Role
                </p>
                <p className="mt-2 text-sm font-medium">Member</p>
              </div>
              <div className="rounded-2xl border border-border/60 p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Email
                </p>
                <p className="mt-2 text-sm font-medium">
                  {user?.email || "Not set"}
                </p>
              </div>
              <div className="rounded-2xl border border-border/60 p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Workspace
                </p>
                <p className="mt-2 text-sm font-medium">{workspaceLabel}</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border bg-muted/20 p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Plan snapshot</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Track your current usage at a glance.
            </p>
            <div className="mt-6 space-y-4">
              <div className="rounded-2xl border border-border/60 bg-background p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Active plan
                </p>
                <p className="mt-2 text-sm font-medium">{planLabel}</p>
              </div>
              <div className="rounded-2xl border border-border/60 bg-background p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Projects generated
                </p>
                <p className="mt-2 text-sm font-medium">
                  {projectCount} total
                </p>
              </div>
              <div className="rounded-2xl border border-border/60 bg-background p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Seats
                </p>
                <p className="mt-2 text-sm font-medium">{seatsLabel}</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border bg-card/70 p-6 shadow-sm lg:col-span-3">
            <h2 className="text-lg font-semibold">Security and access</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Keep your workspace protected with modern authentication options.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-border/60 p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Password
                </p>
                <p className="mt-2 text-sm font-medium">{passwordLabel}</p>
              </div>
              <div className="rounded-2xl border border-border/60 p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Two-factor auth
                </p>
                <p className="mt-2 text-sm font-medium">{mfaStatus}</p>
              </div>
              <div className="rounded-2xl border border-border/60 p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Sessions
                </p>
                <p className="mt-2 text-sm font-medium">Not available</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AccountPage;
