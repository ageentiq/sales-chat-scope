import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  variant?: "default" | "success" | "warning" | "info";
}

export const MetricCard = ({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  variant = "default" 
}: MetricCardProps) => {
  const variantStyles = {
    default: "border-border",
    success: "border-success bg-gradient-to-br from-success/5 to-success/10",
    warning: "border-warning bg-gradient-to-br from-warning/5 to-warning/10", 
    info: "border-info bg-gradient-to-br from-info/5 to-info/10"
  };

  const iconStyles = {
    default: "text-primary",
    success: "text-success",
    warning: "text-warning",
    info: "text-info"
  };

  return (
    <Card className={cn("border-2 transition-all hover:shadow-md", variantStyles[variant])}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className={cn("h-5 w-5", iconStyles[variant])} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        {trend && (
          <p className="text-xs text-muted-foreground mt-1">{trend}</p>
        )}
      </CardContent>
    </Card>
  );
};