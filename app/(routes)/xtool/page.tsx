import { redirect } from "next/navigation";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { isDeveloper } from "@/lib/developers";
import CreatorDashboard from "@/components/creator/creator-dashboard";
import { CreatorLayout } from "@/components/creator/creator-layout";
import { ensureUserFromKinde } from "@/lib/billing";
import { ensureUserCredits, syncRealtimeCredits } from "@/lib/credits";
import { getModuleUsageSeries } from "@/lib/module-usage";

export default async function XToolDashboardPage() {
  const session = await getKindeServerSession();
  const user = await session.getUser();
  if (!user) {
    redirect("/api/auth/login");
  }
  const userName = user?.given_name || user?.family_name || "Creator";
  const initialIsDeveloper = user ? await isDeveloper(user.id) : false;
  await ensureUserFromKinde(user);
  const userCredits = await ensureUserCredits(user.id);
  await syncRealtimeCredits({ kindeId: user.id });
  const usageSeries = await getModuleUsageSeries({
    userId: user.id,
    module: "XDESIGN",
  });
  return (
    <CreatorLayout
      user={user}
      credits={userCredits.credits}
      isDeveloper={initialIsDeveloper}
    >
      <CreatorDashboard
        userName={userName}
        initialUser={user ?? undefined}
        initialIsDeveloper={initialIsDeveloper}
        credits={userCredits.credits}
        usageSeries={usageSeries}
      />
    </CreatorLayout>
  );
}
