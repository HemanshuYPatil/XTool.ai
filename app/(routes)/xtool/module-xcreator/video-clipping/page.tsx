import { redirect } from "next/navigation";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { CreatorLayout } from "@/components/creator/creator-layout";
import { VideoClippingTool } from "@/components/creator/xcreator/video-clipping-tool";
import { SparklesIcon } from "lucide-react";

export default async function VideoClippingPage() {
  const session = await getKindeServerSession();
  const user = await session.getUser();
  if (!user) {
    redirect("/api/auth/login");
  }

  return (
    <CreatorLayout user={user}>
      <div className="max-w-5xl mx-auto space-y-12 py-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">AI Video Clipping</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Transform long-form content into viral-ready clips with intelligent scene detection.
          </p>
        </div>

        <VideoClippingTool />
        
        <div className="grid gap-8 md:grid-cols-2">
          <div className="rounded-3xl border bg-card/40 p-8 space-y-4">
            <h3 className="text-lg font-bold">Recent Clips</h3>
            <p className="text-sm text-muted-foreground italic">No clips generated yet. Paste a URL to get started.</p>
          </div>
          <div className="rounded-3xl border bg-card/40 p-8 space-y-4">
            <h3 className="text-lg font-bold">Clipping Tips</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">• Use high-quality source videos</li>
              <li className="flex items-center gap-2">• AI works best with clear speech</li>
              <li className="flex items-center gap-2">• Auto-captions are generated in 20+ languages</li>
            </ul>
          </div>
        </div>
      </div>
    </CreatorLayout>
  );
}
