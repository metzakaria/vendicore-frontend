"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Activity, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getActivityData } from "../_actions/getActivityData";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

type TimeFilter = "today" | "7days" | "14days" | "30days" | "year";

const getDateRange = (filter: TimeFilter) => {
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  const endDate = today.toISOString();

  let startDate: Date;
  switch (filter) {
    case "today":
      startDate = new Date();
      startDate.setHours(0, 0, 0, 0);
      break;
    case "7days":
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
      startDate.setHours(0, 0, 0, 0);
      break;
    case "14days":
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 14);
      startDate.setHours(0, 0, 0, 0);
      break;
    case "30days":
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      startDate.setHours(0, 0, 0, 0);
      break;
    case "year":
      startDate = new Date();
      startDate.setFullYear(startDate.getFullYear() - 1);
      startDate.setHours(0, 0, 0, 0);
      break;
    default:
      startDate = new Date();
      startDate.setHours(0, 0, 0, 0);
  }

  return {
    startDate: startDate.toISOString(),
    endDate,
  };
};

const getFilterLabel = (filter: TimeFilter) => {
  switch (filter) {
    case "today":
      return "Today";
    case "7days":
      return "Last 7 Days";
    case "14days":
      return "Last 2 Weeks";
    case "30days":
      return "Last 30 Days";
    case "year":
      return "Last Year";
    default:
      return "Today";
  }
};

export const ActivityChart = ({ timeFilter }: { timeFilter: TimeFilter }) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-activity-data", timeFilter],
    queryFn: () => getActivityData(getDateRange(timeFilter)),
    staleTime: 30000,
  });

  const activityData = data?.activityData || [];
  const hasData = activityData.some(d => d.count > 0);

  console.log('ADMIN CHART DEBUG:', { 
    hasData, 
    dataLength: activityData.length,
    allData: activityData,
    dataWithCounts: activityData.filter(d => d.count > 0)
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Transaction Activity
        </CardTitle>
        <CardDescription>
          {getFilterLabel(timeFilter)}
          {data && (
            <span className="ml-2 text-xs">
              • {data.totalTransactions} transactions 
              {data.aggregationType !== 'daily' && ` • Grouped by ${data.aggregationType}`}
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-80 w-full">
            <Skeleton className="w-full h-full" />
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Error loading chart data
            </AlertDescription>
          </Alert>
        ) : !hasData ? (
          <div className="h-80 w-full flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No transactions in this period</p>
            </div>
          </div>
        ) : (
          <div style={{ width: '100%', height: '320px', overflow: 'auto' }}>
            <LineChart 
              width={1100}
              height={320}
              data={activityData} 
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date"
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line 
                type="monotone"
                dataKey="count" 
                stroke="#2563eb"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </LineChart>
          </div>
        )}
      </CardContent>
    </Card>
  );
};