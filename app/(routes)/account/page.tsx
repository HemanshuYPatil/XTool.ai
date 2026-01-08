import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import prisma from "@/lib/prisma";
import { ensureUserFromKinde } from "@/lib/billing";
import { syncRealtimeCredits } from "@/lib/credits";
import { isDeveloper } from "@/lib/developers";
import DeveloperTools from "@/components/developer-tools";
import { CreatorLayout } from "@/components/creator/creator-layout";
import { RealtimeCreditsValue } from "@/components/credits/realtime-credits";

const AccountPage = async () => {
  const { getUser } = getKindeServerSession();
  const [user] = await Promise.all([
    getUser(),
  ]);
  if (user) {
    await ensureUserFromKinde(user);
    await syncRealtimeCredits({ kindeId: user.id });
  }
  const developer = user ? await isDeveloper(user.id) : false;
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
  
  return (
    <CreatorLayout user={user}>
      <div className="space-y-12 py-8">
        <div className="space-y-3 border-b pb-8">
          <p className="text-xs uppercase tracking-[0.2em] text-primary font-bold">
            Account
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Manage your profile and workspace
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Keep your details, preferences, and team visibility aligned with
            how you build in XTool.ai.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="rounded-3xl border bg-card/40 p-8 shadow-sm lg:col-span-2 space-y-8">
            <div>
              <h2 className="text-xl font-bold">Profile details</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Update your name, role, and contact information.
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="rounded-2xl border bg-background/50 p-5 transition-colors hover:border-primary/20">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Full name
                </p>
                <p className="mt-2 text-sm font-bold">
                  {fullName || fallbackName}
                </p>
              </div>
              <div className="rounded-2xl border bg-background/50 p-5 transition-colors hover:border-primary/20">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Role
                </p>
                <p className="mt-2 text-sm font-bold">Member</p>
              </div>
              <div className="rounded-2xl border bg-background/50 p-5 transition-colors hover:border-primary/20">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Email
                </p>
                <p className="mt-2 text-sm font-bold">
                  {user?.email || "Not set"}
                </p>
              </div>
              <div className="rounded-2xl border bg-background/50 p-5 transition-colors hover:border-primary/20">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Workspace
                </p>
                <p className="mt-2 text-sm font-bold">{workspaceLabel}</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border bg-primary/5 p-8 shadow-sm space-y-8">
            <div>
              <h2 className="text-xl font-bold">Credit snapshot</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Track your remaining AI credits.
              </p>
            </div>
            <div className="space-y-4">
              <div className="rounded-2xl border bg-background p-5 shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Credits remaining
                </p>
                <p className="mt-2 text-sm font-bold">
                  <RealtimeCreditsValue
                    initialCredits={null}
                    isDeveloper={developer}
                  />
                </p>
              </div>
              <div className="rounded-2xl border bg-background p-5 shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Projects generated
                </p>
                <p className="mt-2 text-sm font-bold">
                  {projectCount} total
                </p>
              </div>
            </div>
          </div>

          {developer ? (
            <div className="lg:col-span-3">
              <DeveloperTools />
            </div>
          ) : null}
        </div>
      </div>
    </CreatorLayout>
  );
};

export default AccountPage;
