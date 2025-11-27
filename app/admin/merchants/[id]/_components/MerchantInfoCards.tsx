"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, Activity, TrendingUp, DollarSign } from "lucide-react";
import { LucideIcon } from "lucide-react";

interface InfoCardProps {
  title: string;
  value: string;
  description?: string;
  icon: LucideIcon;
}

const InfoCard = ({ title, value, description, icon: Icon }: InfoCardProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
};

interface MerchantInfoCardsProps {
  merchant: any;
}

export const MerchantInfoCards = ({ merchant }: MerchantInfoCardsProps) => {
  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
    }).format(Number(amount));
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <InfoCard
        title="Current Balance"
        value={formatCurrency(merchant.current_balance)}
        description="Available balance"
        icon={Wallet}
      />
      <InfoCard
        title="Total Transactions"
        value={(merchant._count?.vas_transactions || 0).toString()}
        description="All time transactions"
        icon={Activity}
      />
      <InfoCard
        title="30-Day Transactions"
        value={merchant.recentTransactionsCount?.toString() || "0"}
        description="Transactions in last 30 days"
        icon={TrendingUp}
      />
      <InfoCard
        title="Total Volume"
        value={formatCurrency(merchant.totalVolume || "0")}
        description="Successful transactions volume"
        icon={DollarSign}
      />
    </div>
  );
};

