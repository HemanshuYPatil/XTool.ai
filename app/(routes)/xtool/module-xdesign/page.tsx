import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { isDeveloper } from "@/lib/developers";
import { getUserWithSubscription } from "@/lib/billing";
import { CreatorLayout } from "@/components/creator/creator-layout";
import LandingSection from "@/app/(routes)/_common/landing-section";

export default async function XDesignModulePage() {
  const session = await getKindeServerSession();
  const user = await session.getUser();
  const initialIsDeveloper = user ? await isDeveloper(user.id) : false;
  const subscriptionData = user ? await getUserWithSubscription(user.id) : null;
  const plan = initialIsDeveloper ? "PRO" : subscriptionData?.plan ?? "FREE";

  return (
    <CreatorLayout user={user}>
      <div className="space-y-6">
        <LandingSection
          initialUser={user ?? undefined}
          initialIsDeveloper={initialIsDeveloper}
          plan={plan}
          showHeader={false}
          mode="page"
        />
      </div>
    </CreatorLayout>
  );
}
