"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Activity } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { getActivityData } from "../_actions/getActivityData";

export const ActivityChart = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-activity-data"],
    queryFn: () => getActivityData(),
    staleTime: 30000,
  });

  const activityData = data?.activityData || [];
  const maxCount = data?.maxCount || 1;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Transaction Activity
        </CardTitle>
        <CardDescription>Last 7 days</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <div className="flex items-end justify-between gap-2 h-64">
              {Array.from({ length: 7 }).map((_, index) => (
                <div key={index} className="flex flex-col items-center gap-2 flex-1">
                  <Skeleton className="w-full h-full" />
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-4 w-8" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-end justify-between gap-2 h-64">
              {activityData.map((data, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center gap-2 flex-1"
                >
                  <div className="relative w-full h-full flex items-end">
                    <div
                      className="w-full bg-primary rounded-t transition-all hover:bg-primary/80 cursor-pointer"
                      style={{
                        height: `${(data.count / maxCount) * 100}%`,
                        minHeight: data.count > 0 ? "4px" : "0",
                      }}
                      title={`${data.count} transactions`}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {data.date}
                  </span>
                  <span className="text-xs font-medium">{data.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
