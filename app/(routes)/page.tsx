import LandingSection from "./_common/landing-section";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export default async function Home() {
  const session = await getKindeServerSession();
  const user = await session.getUser();

  return (
    <div>
      <LandingSection initialUser={user ?? undefined} />
    </div>
  );
}
