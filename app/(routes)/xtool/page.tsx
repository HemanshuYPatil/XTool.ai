import { redirect } from "next/navigation";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { isDeveloper } from "@/lib/developers";
import CreatorDashboard from "@/components/creator/creator-dashboard";
import { CreatorLayout } from "@/components/creator/creator-layout";

export default async function XToolDashboardPage() {
  const session = await getKindeServerSession();
  const user = await session.getUser();
  if (!user) {
    redirect("/api/auth/login");
  }
  const userName = user?.given_name || user?.family_name || "Creator";
  const initialIsDeveloper = user ? await isDeveloper(user.id) : false;

  return (
    <CreatorLayout user={user}>
      <CreatorDashboard
        userName={userName}
        initialUser={user ?? undefined}
        initialIsDeveloper={initialIsDeveloper}
      />
    </CreatorLayout>
  );
}
