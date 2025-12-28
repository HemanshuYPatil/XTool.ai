import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { CreatorLayout } from "@/components/creator/creator-layout";
import { NotificationsList } from "@/components/notifications/notifications-list";

const NotificationsPage = async () => {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  return (
    <CreatorLayout user={user}>
      <div className="space-y-8 py-6">
        <div className="space-y-3 border-b pb-6">
          <p className="text-xs uppercase tracking-[0.2em] text-primary font-bold">
            Notifications
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Notification Center
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Latest activity from your projects and credit usage. Most recent first.
          </p>
        </div>

        <NotificationsList limit={50} />
      </div>
    </CreatorLayout>
  );
};

export default NotificationsPage;

