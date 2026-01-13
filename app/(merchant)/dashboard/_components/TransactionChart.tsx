"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Activity } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { getMerchantActivityData } from "../_actions/getMerchantActivityData";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

type TimeFilter = "today" | "7days" | "14days" | "30days";

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
    default:
      return "Today";
  }
};

export const TransactionChart = ({ timeFilter }: { timeFilter: TimeFilter }) => {
  const { data, isLoading } = useQuery({
    queryKey: ["merchant-activity-data", timeFilter],
    queryFn: () => getMerchantActivityData(getDateRange(timeFilter)),
    staleTime: 30000,
  });

  const activityData = data?.activityData || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Transaction Volume
        </CardTitle>
        <CardDescription>{getFilterLabel(timeFilter)}</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-64 w-full">
            <Skeleton className="w-full h-full" />
          </div>
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={activityData}>
                <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
