import LandingSection from "../_common/landing-section";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { isDeveloper } from "@/lib/developers";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";

export default async function XDesignPage() {
  const session = await getKindeServerSession();
  const user = await session.getUser();
  const initialIsDeveloper = user ? await isDeveloper(user.id) : false;

  return (
    <div className="min-h-screen w-full bg-background">
      <div className="sticky top-0 z-30 border-b border-border/60 bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <Button
            asChild
            variant="outline"
            className="rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide"
          >
            <Link href="/" className="flex items-center gap-2">
              <ArrowLeftIcon className="size-4" />
              Back to dashboard
            </Link>
          </Button>
        </div>
      </div>
      <LandingSection
        initialUser={user ?? undefined}
        initialIsDeveloper={initialIsDeveloper}
        showHeader={false}
        mode="page"
      />
    </div>
  );
}
