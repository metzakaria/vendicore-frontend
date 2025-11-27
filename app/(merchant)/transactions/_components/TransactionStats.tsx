"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface TransactionStatsProps {
  isLoading: boolean;
  transactionCount: number;
  transactionValue: string;
  transactionSuccess: string;
  transactionFail: string;
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
}: TransactionStatsProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <Skeleton className="h-8 w-24 mb-2" />
          ) : (
            <div className="text-3xl font-bold">{transactionCount}</div>
          )}
          <p className="text-xs text-muted-foreground uppercase mt-1">Transaction Count</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <Skeleton className="h-8 w-24 mb-2" />
          ) : (
            <div className="text-3xl font-bold">{formatCurrency(transactionValue)}</div>
          )}
          <p className="text-xs text-muted-foreground uppercase mt-1">Transaction Value (NGN)</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <Skeleton className="h-8 w-24 mb-2" />
          ) : (
            <div className="text-3xl font-bold">{formatCurrency(transactionSuccess)}</div>
          )}
          <p className="text-xs text-muted-foreground uppercase mt-1">Transaction Success (NGN)</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <Skeleton className="h-8 w-24 mb-2" />
          ) : (
            <div className="text-3xl font-bold">{formatCurrency(transactionFail)}</div>
          )}
          <p className="text-xs text-muted-foreground uppercase mt-1">Transaction Fail (NGN)</p>
        </CardContent>
      </Card>
    </div>
  );
};

