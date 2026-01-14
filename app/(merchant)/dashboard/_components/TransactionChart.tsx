"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Activity, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { getMerchantActivityData } from "../_actions/getMerchantActivityData";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { TimeFilter, getDateRange, getFilterLabel } from "@/lib/date-filters";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const TransactionChart = ({ timeFilter }: { timeFilter: TimeFilter }) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["merchant-activity-data", timeFilter],
    queryFn: () => getMerchantActivityData(getDateRange(timeFilter)),
    staleTime: 30000,
    refetchOnMount: true,
  });

  const activityData = data?.activityData || [];
  const hasData = activityData.some(d => d.count > 0);

  // Debug logging
  console.log('Chart render:', {
    timeFilter,
    isLoading,
    hasData,
    dataLength: activityData.length,
    data: data,
    first3: activityData.slice(0, 3)
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Transaction Volume
        </CardTitle>
        <CardDescription>
          {getFilterLabel(timeFilter)}
          {data && (
            <span className="ml-2 text-xs">
              • {data.transactionsInRange} transactions 
              {data.aggregationType !== 'daily' && ` • Grouped by ${data.aggregationType}`}
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-64 w-full">
            <Skeleton className="w-full h-full" />
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Error loading chart data: {(error as Error).message}
            </AlertDescription>
          </Alert>
        ) : !hasData ? (
          <div className="h-64 w-full flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No transactions in this period</p>
              {data?.totalTransactions === 0 ? (
                <p className="text-xs mt-1">No transactions found for your merchant account</p>
              ) : (
                <div className="text-xs mt-2 space-y-1">
                  <p>Total merchant transactions: {data?.totalTransactions}</p>
                  <p>Transactions in selected range: {data?.transactionsInRange}</p>
                  <p>Data points: {activityData.length}</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="w-full">
            <div style={{ width: '100%', height: '300px', backgroundColor: '#fafafa', border: '1px solid #e5e7eb' }}>
              <LineChart 
                width={1000}
                height={300}
                data={activityData} 
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date"
                />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#2563eb" 
                  strokeWidth={3}
                  dot={{ r: 5, fill: '#2563eb' }}
                />
              </LineChart>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};