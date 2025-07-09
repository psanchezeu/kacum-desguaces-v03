
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    positive: boolean;
  };
  className?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  className,
}) => {
  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1 pr-2">
            <p className="text-sm font-medium text-muted-foreground truncate">{title}</p>
            <h3 className="text-xl sm:text-2xl font-bold mt-1 truncate">{value}</h3>
            {trend && (
              <div
                className={`flex items-center mt-1 text-xs font-medium ${
                  trend.positive ? "text-green-500" : "text-red-500"
                }`}
              >
                <span>{trend.value}%</span>
                <span className="ml-1 hidden sm:inline">
                  {trend.positive ? "más que el mes anterior" : "menos que el mes anterior"}
                </span>
                <span className="ml-1 inline sm:hidden">
                  {trend.positive ? "más" : "menos"}
                </span>
              </div>
            )}
          </div>
          <div className="h-10 w-10 sm:h-12 sm:w-12 bg-primary/10 flex-shrink-0 flex items-center justify-center rounded-lg">
            <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsCard;
