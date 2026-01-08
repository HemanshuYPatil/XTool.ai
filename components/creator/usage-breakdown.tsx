"use client";

import * as React from "react";
import { AreaChart as AreaChartIcon } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import type { UsageBreakdown } from "@/lib/dashboard-stats";
import type { ModuleUsageSeriesByModule, UsagePoint } from "@/lib/module-usage";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UsageBreakdownCardProps {
  items: UsageBreakdown[];
  credits?: number | null;
  isDeveloper?: boolean;
  usageSeries?: ModuleUsageSeriesByModule;
}

const chartConfig = {
  xdesign: {
    label: "XDesign",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

type TimeRange = "90d" | "30d" | "7d";

const timeframes = {
  "90d": {
    label: "Last 3 months",
    description: "Monthly XDesign usage.",
    key: "monthly",
    slice: -3,
  },
  "30d": {
    label: "Last 30 days",
    description: "Daily XDesign usage.",
    key: "daily",
    slice: undefined,
  },
  "7d": {
    label: "Last 7 days",
    description: "Daily XDesign usage.",
    key: "daily",
    slice: -7,
  },
} as const;

const formatDateLabel = (value: string, range: TimeRange) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  if (range === "90d") {
    return date.toLocaleDateString("en-US", { month: "short" });
  }
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

export const UsageBreakdownCard = ({
  usageSeries,
}: UsageBreakdownCardProps) => {
  const [timeRange, setTimeRange] = React.useState<TimeRange>("90d");
  const selectedRange = timeframes[timeRange];

  const chartData = React.useMemo(() => {
    const points = usageSeries?.[selectedRange.key]?.XDESIGN ?? [];
    const sliced = selectedRange.slice ? points.slice(selectedRange.slice) : points;
    return sliced.map((point: UsagePoint) => ({
      date: point.date ?? point.label,
      xdesign: point.value,
    }));
  }, [selectedRange.key, selectedRange.slice, usageSeries]);

  const hasSeries = chartData.length > 0;

  return (
    <Card className="h-full overflow-hidden border-border/60 shadow-sm">
      <CardHeader className="flex flex-col gap-4 border-b border-border/60 py-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10">
            <AreaChartIcon className="size-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">Usage pulse</CardTitle>
            <CardDescription>{selectedRange.description}</CardDescription>
          </div>
        </div>
        <Select value={timeRange} onValueChange={(value) => setTimeRange(value as TimeRange)}>
          <SelectTrigger className="w-[180px] rounded-full" aria-label="Select time range">
            <SelectValue placeholder={selectedRange.label} />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="90d" className="rounded-lg">
              Last 3 months
            </SelectItem>
            <SelectItem value="30d" className="rounded-lg">
              Last 30 days
            </SelectItem>
            <SelectItem value="7d" className="rounded-lg">
              Last 7 days
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-4 pb-6 pt-6">
        <div className="relative h-72 w-full overflow-hidden rounded-2xl border border-border/40 bg-gradient-to-b from-muted/20 to-background">
          {hasSeries ? (
            <ChartContainer config={chartConfig} className="h-full w-full p-4">
              <AreaChart data={chartData} margin={{ left: 8, right: 12, top: 12, bottom: 8 }}>
                <defs>
                  <linearGradient id="xdesignFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-xdesign)" stopOpacity="0.24" />
                    <stop offset="100%" stopColor="var(--color-xdesign)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="var(--border)" strokeOpacity={0.2} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                  minTickGap={24}
                  interval={timeRange === "30d" ? 4 : 0}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                  tickFormatter={(value) => formatDateLabel(String(value), timeRange)}
                />
                <YAxis
                  width={32}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      config={chartConfig}
                      labelFormatter={(value) => formatDateLabel(String(value), timeRange)}
                    />
                  }
                />
                <Area
                  dataKey="xdesign"
                  type="monotone"
                  stroke="var(--color-xdesign)"
                  strokeWidth={3}
                  fill="url(#xdesignFill)"
                  fillOpacity={1}
                  activeDot={{ r: 4 }}
                />
              </AreaChart>
            </ChartContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              No usage data yet.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
