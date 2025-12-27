import { redirect } from "next/navigation";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { CreatorLayout } from "@/components/creator/creator-layout";
import { ChannelManagement } from "@/components/creator/xcreator/channel-management";

export default async function AccountsPage() {
  const session = await getKindeServerSession();
  const user = await session.getUser();
  if (!user) {
    redirect("/api/auth/login");
  }

  return (
    <CreatorLayout user={user}>
      <div className="max-w-6xl mx-auto space-y-12 py-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between border-b pb-8">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Manage Accounts</h1>
            <p className="text-muted-foreground">
              Connect and manage your social media channels.
            </p>
          </div>
        </div>

        <ChannelManagement />
      </div>
    </CreatorLayout>
  );
}
