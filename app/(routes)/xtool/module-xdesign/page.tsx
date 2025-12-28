import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { isDeveloper } from "@/lib/developers";
import { ensureUserCredits } from "@/lib/credits";
import { CreatorLayout } from "@/components/creator/creator-layout";
import LandingSection from "@/app/(routes)/_common/landing-section";

export default async function XDesignModulePage() {
  const session = await getKindeServerSession();
  const user = await session.getUser();
  const initialIsDeveloper = user ? await isDeveloper(user.id) : false;
  let initialCredits = null;
  if (user) {
    const userCredits = await ensureUserCredits(user.id);
    initialCredits = userCredits.credits;
  }

  return (
    <CreatorLayout
      user={user}
      credits={initialCredits}
      isDeveloper={initialIsDeveloper}
    >
      <div className="space-y-6">
        <LandingSection
          initialUser={user ?? undefined}
          initialIsDeveloper={initialIsDeveloper}
          initialCredits={initialCredits}
          showHeader={false}
          mode="page"
        />
      </div>
    </CreatorLayout>
  );
}
