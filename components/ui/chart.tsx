"use client";

import * as React from "react";
import * as Recharts from "recharts";

import { cn } from "@/lib/utils";

export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode;
    icon?: React.ComponentType;
    color?: string;
  };
};

type ChartContainerProps = React.HTMLAttributes<HTMLDivElement> & {
  config: ChartConfig;
  children: React.ReactNode;
};

const ChartContainer = React.forwardRef<HTMLDivElement, ChartContainerProps>(
  ({ className, config, children, ...props }, ref) => {
    const cssVars = Object.entries(config).reduce<Record<string, string>>((acc, [key, value]) => {
      if (value?.color) {
        acc[`--color-${key}`] = value.color;
      }
      return acc;
    }, {});

    return (
      <div
        ref={ref}
        className={cn("flex h-full w-full flex-col", className)}
        style={cssVars}
        {...props}
      >
        <Recharts.ResponsiveContainer>{children}</Recharts.ResponsiveContainer>
      </div>
    );
  },
);
ChartContainer.displayName = "ChartContainer";

type ChartTooltipProps = React.ComponentProps<typeof Recharts.Tooltip>;

const ChartTooltip = (props: ChartTooltipProps) => (
  <Recharts.Tooltip {...props} />
);

type ChartTooltipContentProps = React.ComponentProps<"div"> & {
  active?: boolean;
  payload?: Array<{
    name?: string;
    value?: number;
    payload?: Record<string, unknown>;
    color?: string;
  }>;
  label?: React.ReactNode;
  labelFormatter?: (label: React.ReactNode) => React.ReactNode;
  config?: ChartConfig;
};

const ChartTooltipContent = React.forwardRef<HTMLDivElement, ChartTooltipContentProps>(
  ({ active, payload, label, labelFormatter, config, className, style }, ref) => {
    if (!active || !payload?.length) return null;
    const resolvedLabel = labelFormatter ? labelFormatter(label) : label;

    return (
      <div
        ref={ref}
        className={cn(
          "grid min-w-[160px] gap-2 rounded-xl border border-border bg-background/95 p-3 text-xs shadow-xl",
          className,
        )}
        style={style}
      >
        {resolvedLabel ? (
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {resolvedLabel}
          </div>
        ) : null}
        <div className="grid gap-1">
          {payload.map((item) => {
            const key = item.name ?? "";
            const entry = config?.[key];
            const value = typeof item.value === "number" ? item.value : 0;
            return (
              <div key={key} className="flex items-center justify-between gap-6">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-muted-foreground">
                    {entry?.label ?? key}
                  </span>
                </div>
                <span className="font-mono font-semibold text-foreground">
                  {value}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  },
);
ChartTooltipContent.displayName = "ChartTooltipContent";

type ChartLegendProps = React.ComponentProps<typeof Recharts.Legend>;

const ChartLegend = (props: ChartLegendProps) => <Recharts.Legend {...props} />;

type ChartLegendContentProps = React.ComponentProps<"div"> & {
  payload?: Array<{ value?: string; color?: string }>;
  config?: ChartConfig;
};

const ChartLegendContent = React.forwardRef<HTMLDivElement, ChartLegendContentProps>(
  ({ className, payload, config, style }, ref) => {
    if (!payload?.length) return null;

    return (
      <div ref={ref} className={cn("flex flex-wrap gap-4 text-sm", className)} style={style}>
        {payload.map((item) => {
          const key = item.value ?? "";
          const entry = config?.[key];
          return (
            <div key={key} className="flex items-center gap-2">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-muted-foreground">
                {entry?.label ?? key}
              </span>
            </div>
          );
        })}
      </div>
    );
  },
);
ChartLegendContent.displayName = "ChartLegendContent";

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
};
