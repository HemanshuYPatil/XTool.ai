import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { CreatorLayout } from "@/components/creator/creator-layout";
import { Settings2Icon, BellIcon, ShieldCheckIcon, PaletteIcon } from "lucide-react";
import ThemeToggle from "@/components/settings/theme-toggle";

export default async function SettingsPage() {
  const session = await getKindeServerSession();
  const user = await session.getUser();

  return (
    <CreatorLayout user={user}>
      <div className="space-y-12 py-8">
        <div className="space-y-3 border-b pb-8">
          <p className="text-xs uppercase tracking-[0.2em] text-primary font-bold">
            Settings
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Preferences and Security
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Customize your workspace experience and manage security settings.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-3xl border bg-card/40 p-8 shadow-sm space-y-8">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <PaletteIcon className="size-5 text-blue-500" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Appearance</h2>
                <p className="text-sm text-muted-foreground">Customize how XTool looks to you.</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-2xl border bg-background/50">
                <div>
                  <p className="text-sm font-bold">Theme</p>
                  <p className="text-xs text-muted-foreground">Switch between light and dark mode.</p>
                </div>
                <ThemeToggle />
              </div>
            </div>
          </div>

          <div className="rounded-3xl border bg-card/40 p-8 shadow-sm space-y-8">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <BellIcon className="size-5 text-purple-500" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Notifications</h2>
                <p className="text-sm text-muted-foreground">Control when and how you're notified.</p>
              </div>
            </div>

            <div className="space-y-4">
              {['Email Notifications', 'Push Notifications', 'Weekly Reports'].map((item) => (
                <div key={item} className="flex items-center justify-between p-4 rounded-2xl border bg-background/50">
                  <p className="text-sm font-bold">{item}</p>
                  <div className="h-6 w-11 rounded-full bg-primary relative cursor-pointer">
                    <div className="absolute right-1 top-1 h-4 w-4 rounded-full bg-white" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border bg-card/40 p-8 shadow-sm lg:col-span-2 space-y-8">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <ShieldCheckIcon className="size-5 text-emerald-500" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Security</h2>
                <p className="text-sm text-muted-foreground">Manage your account security and authentication.</p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="p-6 rounded-2xl border bg-background/50 space-y-4">
                <p className="text-sm font-bold">Two-Factor Authentication</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Add an extra layer of security to your account by requiring more than just a password to log in.
                </p>
                <button className="text-xs font-bold text-primary hover:underline">Enable 2FA →</button>
              </div>
              <div className="p-6 rounded-2xl border bg-background/50 space-y-4">
                <p className="text-sm font-bold">Password Management</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Last changed 3 months ago. We recommend updating your password regularly.
                </p>
                <button className="text-xs font-bold text-primary hover:underline">Change Password →</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CreatorLayout>
  );
}
