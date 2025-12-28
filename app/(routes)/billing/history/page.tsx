import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { CreatorLayout } from "@/components/creator/creator-layout";
import { CreditHistory } from "@/components/credits/credit-history";
import { BackButton } from "@/components/back-button";
import { ensureUserFromKinde } from "@/lib/billing";
import { ensureUserCredits, getCreditTransactionsForUser, syncRealtimeCredits } from "@/lib/credits";
import { isDeveloper } from "@/lib/developers";
export const dynamic = "force-dynamic";

const CreditsHistoryPage = async () => {
  const { getUser } = getKindeServerSession();
  const user = await getUser();
  let initialCredits = null;
  let initialTransactions: any[] = [];
  const developer = user ? await isDeveloper(user.id) : false;

  if (user) {
    await ensureUserFromKinde(user);
    const userCredits = await ensureUserCredits(user.id);
    initialCredits = userCredits.credits;
    await syncRealtimeCredits({ kindeId: user.id });

    const transactions = await getCreditTransactionsForUser({
      kindeId: user.id,
      limit: 50,
    });

    initialTransactions = transactions.map((tx) => ({
      _id: tx.id,
      transactionId: tx.id,
      amount: tx.amount,
      reason: tx.reason,
      modelTokens: tx.modelTokens,
      promptTokens: tx.promptTokens,
      completionTokens: tx.completionTokens,
      details: tx.details,
      createdAt: tx.createdAt.getTime(),
    }));
  }

  return (
    <CreatorLayout user={user} credits={initialCredits} isDeveloper={developer}>
      <div className="space-y-10 py-8">
        <div className="space-y-6">
          <BackButton />
          
          <div className="space-y-3 border-b pb-8">
            <p className="text-xs uppercase tracking-[0.2em] text-primary font-bold">
              Transaction History
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Credits Activity
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              A detailed record of all your credit transactions, including generations and top-ups.
            </p>
          </div>
        </div>

        <div className="max-w-5xl">
          <CreditHistory
            initialTransactions={initialTransactions}
            initialUser={user ?? undefined}
            isDeveloper={developer}
          />
        </div>
      </div>
    </CreatorLayout>
  );
};

export default CreditsHistoryPage;
