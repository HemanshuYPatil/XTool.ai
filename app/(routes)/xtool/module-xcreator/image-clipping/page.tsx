import { redirect } from "next/navigation";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { CreatorLayout } from "@/components/creator/creator-layout";
import { ImageClippingTool } from "@/components/creator/xcreator/image-clipping-tool";
import { SparklesIcon } from "lucide-react";
import { showXCreator } from "@/lib/feature-flags";

export default async function ImageClippingPage() {
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
      <div className="max-w-5xl mx-auto space-y-12 py-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">AI Image Clipping</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Intelligent background removal, upscaling, and social media optimization.
          </p>
        </div>

        <ImageClippingTool />

        <div className="grid gap-8 md:grid-cols-2">
          <div className="rounded-3xl border bg-card/40 p-8 space-y-4">
            <h3 className="text-lg font-bold">Asset Library</h3>
            <p className="text-sm text-muted-foreground italic">Your processed images will appear here.</p>
          </div>
          <div className="rounded-3xl border bg-card/40 p-8 space-y-4">
            <h3 className="text-lg font-bold">Image Formats</h3>
            <div className="flex flex-wrap gap-2">
              {['1:1 Square', '9:16 Story', '4:5 Portrait', '16:9 Landscape'].map(f => (
                <span key={f} className="rounded-full bg-primary/5 px-3 py-1 text-[10px] font-bold text-primary border border-primary/10">
                  {f}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </CreatorLayout>
  );
}
