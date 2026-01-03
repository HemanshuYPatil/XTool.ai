import { redirect } from "next/navigation";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { CreatorLayout } from "@/components/creator/creator-layout";
import { XCreatorDashboard } from "@/components/creator/xcreator/xcreator-dashboard";
import { SparklesIcon } from "lucide-react";
import { showXCreator } from "@/lib/feature-flags";

export default async function XCreatorModulePage() {
  if (!showXCreator) {
    redirect("/xtool");
  }

  const session = await getKindeServerSession();
  const user = await session.getUser();
  if (!user) {
    redirect("/api/auth/login");
  }

  return (
    <CreatorLayout user={user}>
      <div className="max-w-6xl mx-auto space-y-12 py-8">
        {/* Module Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between border-b pb-8">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">XCreator Studio</h1>
            <p className="text-muted-foreground">
              Your command center for content performance and scheduling.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary border border-primary/20">
              <SparklesIcon className="mr-1 h-3 w-3" />
              AI Enhanced
            </span>
          </div>
        </div>

        <XCreatorDashboard />
      </div>
    </CreatorLayout>
  );
}
