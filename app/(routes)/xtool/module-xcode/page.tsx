import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { CreatorLayout } from "@/components/creator/creator-layout";
import XCodeCliOverview from "@/components/xcode-cli/xcode-cli-overview";
import OpenRouterPanel from "@/components/xcode-cli/openrouter-panel";

export default async function XCodeModulePage() {
  const session = await getKindeServerSession();
  const user = await session.getUser();

  return (
    <CreatorLayout user={user}>
      <div className="max-w-5xl mx-auto space-y-12 py-8">
        {/* Module Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between border-b pb-8">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">XCode CLI</h1>
            <p className="text-muted-foreground">
              Manage your agentic coding environment and OpenRouter connections.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-500">
              <span className="mr-1 h-1.5 w-1.5 rounded-full bg-emerald-500" />
              System Active
            </span>
          </div>
        </div>

        <XCodeCliOverview />
        
        {/* <div id="openrouter" className="pt-8 border-t">
          <OpenRouterPanel />
        </div> */}
      </div>
    </CreatorLayout>
  );
}
