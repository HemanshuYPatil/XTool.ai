import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { ensureUserFromKinde } from "@/lib/billing";
import { ensureUserCredits, getCreditTransactionsForUser, syncRealtimeCredits } from "@/lib/credits";
import { isDeveloper } from "@/lib/developers";
import { CreatorLayout } from "@/components/creator/creator-layout";
import {
  RealtimeCreditsValue,
} from "@/components/credits/realtime-credits";
import { CreditHistoryList } from "@/components/credits/credit-history-list";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon } from "lucide-react";

const BillingPage = async () => {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  let initialCredits = null;
  let transactions: {
    id: string;
    amount: number;
    reason: string;
    modelTokens?: number;
    promptTokens?: number;
    completionTokens?: number;
    details?: { amount: number; reason: string; modelTokens?: number }[];
    createdAt: Date;
  }[] = [];
  if (user) {
    await ensureUserFromKinde(user);
    const userCredits = await ensureUserCredits(user.id);
    initialCredits = userCredits.credits;
    await syncRealtimeCredits({ kindeId: user.id });
    transactions = await getCreditTransactionsForUser({
      kindeId: user.id,
      limit: 10,
    });
  }

  const developer = user ? await isDeveloper(user.id) : false;
  const credits = developer ? null : initialCredits;
  return (
    <CreatorLayout user={user} credits={initialCredits} isDeveloper={developer}>
      <div className="space-y-12 py-8">
        <div className="space-y-3 border-b pb-8">
          <p className="text-xs uppercase tracking-[0.2em] text-primary font-bold">
            Credits
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Token balance and usage
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Manage your AI credits and track recent usage.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="rounded-3xl border bg-primary/5 p-8 shadow-sm lg:col-span-2 space-y-6">
            <div>
              <h2 className="text-xl font-bold">Current balance</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Credits available for AI generation.
              </p>
            </div>
            <div className="rounded-2xl border bg-background p-6 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Credits
              </p>
              <p className="mt-2 text-3xl font-bold">
                <RealtimeCreditsValue
                  initialCredits={credits}
                  isDeveloper={developer}
                />
              </p>
            </div>
          </div>

          <div className="rounded-3xl border bg-card/40 p-8 shadow-sm space-y-6">
            <div>
              <h2 className="text-xl font-bold">Top up</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Purchase credit packs (coming soon).
              </p>
            </div>
            <div className="rounded-2xl border bg-background/50 p-5">
              <p className="text-xs text-muted-foreground">
                Contact support to enable purchases for your workspace.
              </p>
            </div>
          </div>

          <div className="rounded-3xl border bg-card/40 p-8 shadow-sm lg:col-span-3 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Recent usage</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Latest credit deductions.
                </p>
              </div>
              <Link href="/billing/history">
                <Button variant="ghost" size="sm" className="rounded-xl gap-2 text-primary font-bold hover:bg-primary/5">
                  View All History
                  <ArrowRightIcon className="size-4" />
                </Button>
              </Link>
            </div>
            <div className="overflow-hidden rounded-2xl border">
              <div className="grid grid-cols-3 bg-muted/50 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                <div className="px-6 py-3">Date</div>
                <div className="px-6 py-3">Reason</div>
                <div className="px-6 py-3 text-right">Credits</div>
              </div>
              <div className="divide-y text-sm">
                <CreditHistoryList initialTransactions={transactions} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </CreatorLayout>
  );
};

export default BillingPage;
