"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Coins, Activity, TrendingUp, Wallet, Filter, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MerchantKPICard } from "./MerchantKPICard";
import { RecentTransactions } from "./RecentTransactions";
import { getMerchantDashboardStats } from "../_actions/getMerchantDashboardStats";
import { getRecentMerchantTransactions } from "../_actions/getRecentMerchantTransactions";

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

const fetchDashboardStats = async (filter: TimeFilter) => {
  const dateRange = getDateRange(filter);
  const result = await getMerchantDashboardStats(dateRange);
  if (result.error) {
    throw new Error(result.error);
  }
  return result;
};

const fetchRecentTransactions = async () => {
  const result = await getRecentMerchantTransactions({
    limit: 10,
  });
  if (result.error) {
    throw new Error(result.error);
  }
  return result.transactions;
};

export const MerchantDashboard = () => {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("today");

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["merchant-dashboard-stats", timeFilter],
    queryFn: () => fetchDashboardStats(timeFilter),
    staleTime: 30000,
  });

  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ["merchant-recent-transactions"],
    queryFn: () => fetchRecentTransactions(),
    staleTime: 30000,
  });

  const formatCurrency = (amount: string) => {
    return `₦${new Intl.NumberFormat("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(amount))}`;
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            {stats?.merchant?.business_name || "Merchant"} Dashboard
          </h2>
          <p className="text-muted-foreground">
            Welcome back! Here&apos;s an overview of your account.
          </p>
        </div>
        <div className="flex items-center gap-1.5 rounded-md border border-primary/20 bg-white px-2 py-1">
          <Filter className="h-3.5 w-3.5 text-muted-foreground" />
          <Select value={timeFilter} onValueChange={(value) => setTimeFilter(value as TimeFilter)}>
            <SelectTrigger className="h-8 w-[160px] border-1 bg-transparent shadow-none focus:ring-0 text-sm">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="14days">Last 2 Weeks</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Wallet Balance Card */}
      <div className="grid gap-4 md:grid-cols-1">
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Wallet Balance</p>
              <p className="text-4xl font-bold mt-2">
                {statsLoading ? (
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                ) : (
                  formatCurrency(stats?.merchant?.current_balance || "0")
                )}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Merchant Code: {stats?.merchant?.merchant_code || "N/A"}
              </p>
            </div>
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Wallet className="h-8 w-8 text-primary" />
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <MerchantKPICard
          title="Total Transactions"
          value={statsLoading ? <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /> : stats?.stats?.totalTransactions || 0}
          description={`Transaction count (${getFilterLabel(timeFilter).toLowerCase()})`}
          icon={Activity}
        />
        <MerchantKPICard
          title="Transaction Volume"
          value={
            statsLoading
              ? <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              : formatCurrency(stats?.stats?.totalVolume ?? "0")
          }
          description={`Transaction volume (${getFilterLabel(timeFilter).toLowerCase()})`}
          icon={Coins}
        />
        <MerchantKPICard
          title="Success Rate"
          value={statsLoading ? <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /> : (stats?.stats?.successRate ?? "0%")}
          description={`Success rate (${getFilterLabel(timeFilter).toLowerCase()})`}
          icon={TrendingUp}
        />
      </div>

      {/* Recent Transactions */}
      <RecentTransactions
        transactions={transactions || []}
        isLoading={transactionsLoading}
      />
    </div>
  );
};

