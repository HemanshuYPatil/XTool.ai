import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import CreatorDashboard from "@/components/creator/creator-dashboard";
import { CreatorLayout } from "@/components/creator/creator-layout";

const CreatorModulePage = async () => {
  const session = await getKindeServerSession();
  const user = await session.getUser();
  const userName = user?.given_name || user?.family_name || "Creator";

  return (
    <CreatorLayout user={user}>
      <CreatorDashboard userName={userName} />
    </CreatorLayout>
  );
};

export default CreatorModulePage;
