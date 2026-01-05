import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

interface SparklineData {
  value: number;
}

interface KPITileProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  iconColor?: string;
  iconBgColor?: string;
  delta?: number | null;
  deltaLabel?: string;
  sparklineData?: SparklineData[];
  tooltip?: string;
  secondaryValue?: string | number;
  secondaryLabel?: string;
  compareEnabled?: boolean;
}

export const KPITile = ({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = "text-primary",
  iconBgColor = "bg-primary/10",
  delta,
  deltaLabel,
  sparklineData = [],
  tooltip,
  secondaryValue,
  secondaryLabel,
  compareEnabled = false,
}: KPITileProps) => {
  // Generate sparkline path
  const sparklinePath = useMemo(() => {
    if (sparklineData.length < 2) return null;
    
    const max = Math.max(...sparklineData.map(d => d.value), 1);
    const min = Math.min(...sparklineData.map(d => d.value), 0);
    const range = max - min || 1;
    
    const width = 60;
    const height = 20;
    const padding = 2;
    
    const points = sparklineData.map((d, i) => {
      const x = padding + (i / (sparklineData.length - 1)) * (width - padding * 2);
      const y = height - padding - ((d.value - min) / range) * (height - padding * 2);
      return `${x},${y}`;
    });
    
    return `M ${points.join(' L ')}`;
  }, [sparklineData]);

  const getDeltaColor = (delta: number) => {
    if (delta > 0) return "text-green-600 bg-green-50";
    if (delta < 0) return "text-red-600 bg-red-50";
    return "text-gray-500 bg-gray-100";
  };

  const getDeltaIcon = (delta: number) => {
    if (delta > 0) return "↑";
    if (delta < 0) return "↓";
    return "→";
  };

  return (
    <Card className="bg-white border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 rounded-xl overflow-hidden group">
      <CardContent className="p-4 md:p-5">
        {/* Header with icon */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-xs md:text-sm font-medium text-gray-600 truncate">
                {title}
              </h3>
              {tooltip && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className={cn("p-1.5 rounded-lg shrink-0", iconBgColor)}>
                      <Icon className={cn("h-3.5 w-3.5 md:h-4 md:w-4", iconColor)} />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>{tooltip}</p>
                  </TooltipContent>
                </Tooltip>
              )}
              {!tooltip && (
                <div className={cn("p-1.5 rounded-lg shrink-0", iconBgColor)}>
                  <Icon className={cn("h-3.5 w-3.5 md:h-4 md:w-4", iconColor)} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main value and sparkline */}
        <div className="flex items-end justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-2xl md:text-3xl font-bold text-gray-900 tabular-nums">
                {value}
              </span>
              {secondaryValue !== undefined && secondaryLabel && (
                <span className="text-sm text-gray-500">
                  <span className="text-primary font-semibold">{secondaryValue}</span>
                  <span className="text-xs ml-1">{secondaryLabel}</span>
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
            )}
          </div>
          
          {/* Sparkline */}
          {sparklinePath && (
            <div className="shrink-0">
              <svg width="60" height="20" className="opacity-60 group-hover:opacity-100 transition-opacity">
                <path
                  d={sparklinePath}
                  fill="none"
                  stroke={delta && delta >= 0 ? "#22c55e" : delta && delta < 0 ? "#ef4444" : "#6b7280"}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Delta indicator */}
        {compareEnabled && delta !== null && delta !== undefined && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <span className={cn(
                "inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium",
                getDeltaColor(delta)
              )}>
                {getDeltaIcon(delta)} {Math.abs(delta).toFixed(1)}%
              </span>
              {deltaLabel && (
                <span className="text-xs text-gray-500">{deltaLabel}</span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
