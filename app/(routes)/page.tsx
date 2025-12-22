import LandingSection from "./_common/landing-section";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { isDeveloper } from "@/lib/developers";

export default async function Home() {
  const session = await getKindeServerSession();
  const user = await session.getUser();
  const initialIsDeveloper = user ? await isDeveloper(user.id) : false;

  return (
    <div>
      <LandingSection
        initialUser={user ?? undefined}
        initialIsDeveloper={initialIsDeveloper}
      />
    </div>
  );
}
