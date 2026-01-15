"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface TransactionStatsProps {
  isLoading: boolean;
  transactionCount: number;
  transactionValue: string;
  transactionSuccess: string;
  transactionFail: string;
  transactionPending: string;
}

const formatCurrency = (amount: string) => {
  return `₦${new Intl.NumberFormat("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(amount))}`;
};

export const TransactionStats = ({
  isLoading,
  transactionCount,
  transactionValue,
  transactionSuccess,
  transactionFail,
  transactionPending,
}: TransactionStatsProps) => {
  return (
    <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
      <Card>
        <CardContent className="pt-4 sm:pt-6">
          {isLoading ? (
            <Skeleton className="h-6 sm:h-8 w-16 sm:w-24 mb-2" />
          ) : (
            <div className="text-xl sm:text-3xl font-bold">{transactionCount}</div>
          )}
          <p className="text-xs text-muted-foreground uppercase mt-1 truncate">Transactions</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-4 sm:pt-6">
          {isLoading ? (
            <Skeleton className="h-6 sm:h-8 w-20 sm:w-24 mb-2" />
          ) : (
            <div className="text-xl sm:text-3xl font-bold truncate">{formatCurrency(transactionValue)}</div>
          )}
          <p className="text-xs text-muted-foreground uppercase mt-1 truncate">Total Value</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-4 sm:pt-6">
          {isLoading ? (
            <Skeleton className="h-6 sm:h-8 w-16 sm:w-24 mb-2" />
          ) : (
            <div className="text-xl sm:text-3xl font-bold truncate">{formatCurrency(transactionSuccess)}</div>
          )}
          <p className="text-xs text-muted-foreground uppercase mt-1 truncate">Success Value</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-4 sm:pt-6">
          {isLoading ? (
            <Skeleton className="h-6 sm:h-8 w-16 sm:w-24 mb-2" />
          ) : (
            <div className="text-xl sm:text-3xl font-bold truncate">{formatCurrency(transactionFail)}</div>
          )}
          <p className="text-xs text-muted-foreground uppercase mt-1 truncate">Fail Value</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-4 sm:pt-6">
          {isLoading ? (
            <Skeleton className="h-6 sm:h-8 w-16 sm:w-24 mb-2" />
          ) : (
            <div className="text-xl sm:text-3xl font-bold truncate">{formatCurrency(transactionPending)}</div>
          )}
          <p className="text-xs text-muted-foreground uppercase mt-1 truncate">Pending Value</p>
        </CardContent>
      </Card>
    </div>
  );
};