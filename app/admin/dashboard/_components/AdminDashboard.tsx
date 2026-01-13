"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Filter, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ActivityChart } from "./ActivityChart";
import { KPICard } from "./KPICard";
import { RecentTransactions } from "./RecentTransactions";
import { getDashboardStats } from "../_actions/getDashboardStats";
import {
  Building2,
  Activity,
  AlertCircle,
  CheckCircle2,
  DollarSign,
  Server,
  Coins,
} from "lucide-react";

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
  const result = await getDashboardStats(dateRange);
  return result;
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

interface AdminDashboardProps {
  userName?: string | null;
  userEmail?: string | null;
}

export const AdminDashboard = ({ userName, userEmail }: AdminDashboardProps) => {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("today");

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["admin-dashboard-stats", timeFilter],
    queryFn: () => fetchDashboardStats(timeFilter),
    staleTime: 30000,
  });

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {/* Header Section - Responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
        <div className="space-y-1">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Welcome back, {userName || userEmail}
          </p>
        </div>
        <div className="flex items-center gap-1.5 rounded-md border border-primary/20 bg-white px-2 py-1 self-start sm:self-center">
          <Filter className="h-3.5 w-3.5 text-muted-foreground" />
          <Select 
            value={timeFilter} 
            onValueChange={(value) => setTimeFilter(value as TimeFilter)}
          >
            <SelectTrigger className="h-8 w-[140px] sm:w-[160px] border-0 bg-transparent shadow-none focus:ring-0 text-sm px-2">
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

      {/* KPI Cards Grid - Responsive */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <KPICard
          title="Total Merchants"
          value={statsLoading ? <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /> : stats?.totalMerchants || 0}
          description="Active merchants on platform"
          icon={Building2}
        />
        <KPICard
          title="Total Providers"
          value={statsLoading ? <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /> : stats?.totalProviderAccounts || 0}
          description="Active provider accounts"
          icon={Server}
        />
        <KPICard
          title={`${getFilterLabel(timeFilter)} Transactions`}
          value={statsLoading ? <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /> : stats?.todayTransactions || 0}
          description={`Total transactions (${getFilterLabel(timeFilter).toLowerCase()})`}
          icon={Activity}
        />
      </div>

      {/* Second Row KPI Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <KPICard
          title={`${getFilterLabel(timeFilter)} Amount`}
          value={statsLoading ? <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /> : stats?.volume || "₦0"}
          description={`Transaction amount (${getFilterLabel(timeFilter).toLowerCase()})`}
          icon={Coins}
        />
        <KPICard
          title={`${getFilterLabel(timeFilter)} Success`}
          value={statsLoading ? <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /> : stats?.successTransactions || 0}
          description={`Successful transactions (${getFilterLabel(timeFilter).toLowerCase()})`}
          icon={CheckCircle2}
        />
        <KPICard
          title={`${getFilterLabel(timeFilter)} Failed`}
          value={statsLoading ? <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /> : stats?.failedTransactions || 0}
          description={`Failed transactions (${getFilterLabel(timeFilter).toLowerCase()})`}
          icon={AlertCircle}
        />
      </div>

      {/* Recent Transactions - Full width on mobile */}
      <div className="grid gap-4">
        <ActivityChart timeFilter={timeFilter} />
        <RecentTransactions />
      </div>
    </div>
  );
};