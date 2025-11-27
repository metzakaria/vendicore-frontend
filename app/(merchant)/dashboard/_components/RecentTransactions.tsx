"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { TransactionDetailModal } from "../../transactions/_components/TransactionDetailModal";
import { TransactionStatusBadge } from "../../_components/TransactionStatusBadge";

interface RecentTransactionsProps {
  transactions: any[];
  isLoading?: boolean;
}

export const RecentTransactions = ({
  transactions,
  isLoading,
}: RecentTransactionsProps) => {
  const router = useRouter();
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const formatCurrency = (amount: string) => {
    return `₦${new Intl.NumberFormat("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(amount))}`;
  };

  const formatDateTime = (date: string | Date | null) => {
    if (!date) return "N/A";
    return format(new Date(date), "MMM dd, yyyy HH:mm");
  };

  const handleRowClick = (transactionId: string) => {
    setSelectedTransactionId(transactionId);
    setIsModalOpen(true);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Beneficiary</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reference</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[60px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                  </TableRow>
                ))
              ) : transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No transactions found
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((tx) => (
                  <TableRow
                    key={tx.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleRowClick(tx.id)}
                  >
                    <TableCell className="text-sm">{formatDateTime(tx.created_at)}</TableCell>
                    <TableCell>
                      <div className="text-sm">{tx.vas_products?.product_name || "N/A"}</div>
                      <div className="text-xs text-muted-foreground">
                        {tx.vas_products?.product_code || ""}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm font-mono">{tx.beneficiary_account}</TableCell>
                    <TableCell className="text-sm font-medium">{formatCurrency(tx.amount)}</TableCell>
                    <TableCell><TransactionStatusBadge status={tx.status} showIcon={false} /></TableCell>
                    <TableCell className="text-sm font-mono">{tx.merchant_ref}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        {transactions.length > 0 && (
          <div className="mt-4 text-center">
            <button
              onClick={() => router.push("/transactions")}
              className="text-sm text-primary hover:underline"
            >
              View all transactions →
            </button>
          </div>
        )}
      </CardContent>
      <TransactionDetailModal
        transactionId={selectedTransactionId}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </Card>
  );
};

