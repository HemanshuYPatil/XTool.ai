import prisma from "@/lib/prisma";
import { ModuleKey } from "@/lib/generated/prisma";

export type RecentProject = {
  id: string;
  name: string;
  thumbnail: string | null;
  theme: string | null;
  updatedAt: Date;
  visibility: "PRIVATE" | "PUBLIC";
};

export type UsageBreakdown = {
  module: string;
  count: number;
  percentage: number;
};

export type ActivityItem = {
  id: string;
  user: string;
  action: string;
  target: string;
  time: Date;
  module: ModuleKey;
};

export type DashboardStats = {
  activeModules: number;
  liveWorkspaces: number;
  totalGenerations: number;
  recentGenerations: number;
  recentProjects: RecentProject[];
  usageBreakdown: UsageBreakdown[];
  recentActivity: ActivityItem[];
};

export const getDashboardStats = async (userId: string): Promise<DashboardStats> => {
  // Active modules: Distinct modules used
  const distinctModules = await prisma.moduleUsageEvent.findMany({
    where: { userId },
    distinct: ['module'],
    select: { module: true },
  });
  const activeModules = distinctModules.length;

  // Live workspaces: Number of Projects
  const liveWorkspaces = await prisma.project.count({
    where: {
      userId,
      deletedAt: null,
    },
  });

  // Total Generations: Total ModuleUsageEvents
  const totalGenerations = await prisma.moduleUsageEvent.count({
    where: { userId },
  });

  // Recent Generations: ModuleUsageEvents in the last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentGenerations = await prisma.moduleUsageEvent.count({
    where: {
      userId,
      usedAt: {
        gte: sevenDaysAgo,
      },
    },
  });

  // Recent Projects
  const recentProjectsRaw = await prisma.project.findMany({
    where: { userId, deletedAt: null },
    orderBy: { updatedAt: 'desc' },
    take: 4,
    select: { id: true, name: true, thumbnail: true, theme: true, updatedAt: true, visibility: true }
  });
  
  const recentProjects: RecentProject[] = recentProjectsRaw.map(p => ({
    ...p,
    visibility: p.visibility === "PUBLIC" ? "PUBLIC" : "PRIVATE"
  }));

  // Usage Breakdown
  const usageByModule = await prisma.moduleUsageEvent.groupBy({
    by: ['module'],
    where: { userId },
    _count: { module: true },
  });

  const totalUsage = usageByModule.reduce((acc, curr) => acc + curr._count.module, 0);
  const usageBreakdown: UsageBreakdown[] = usageByModule.map(item => ({
    module: item.module,
    count: item._count.module,
    percentage: totalUsage > 0 ? Math.round((item._count.module / totalUsage) * 100) : 0,
  }));

  // Recent Activity (from Usage Events)
  const recentEvents = await prisma.moduleUsageEvent.findMany({
    where: { userId },
    orderBy: { usedAt: 'desc' },
    take: 5,
    include: { user: { select: { name: true } } }
  });

  const recentActivity: ActivityItem[] = recentEvents.map(event => ({
    id: event.id,
    user: event.user.name || "You",
    action: "generated with",
    target: event.module,
    time: event.usedAt,
    module: event.module,
  }));

  return {
    activeModules,
    liveWorkspaces,
    totalGenerations,
    recentGenerations,
    recentProjects,
    usageBreakdown,
    recentActivity,
  };
};
