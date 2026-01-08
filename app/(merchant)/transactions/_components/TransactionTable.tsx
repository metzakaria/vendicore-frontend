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
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { TransactionDetailModal } from "./TransactionDetailModal";
import { TransactionStatusBadge } from "../../_components/TransactionStatusBadge";
import { TableOverlayLoader } from "@/components/ui/table-overlay-loader";

// Define the interface for a single transaction item based on the serialized output
interface TransactionTableItem {
  id: string;
  merchant_id: string;
  product_id: string;
  provider_account_id: string | null;
  amount: string;
  discount_amount: string;
  balance_before: string;
  balance_after: string;
  merchant_ref: string;
  provider_ref: string | null;
  beneficiary_account: string;
  status: string;
  is_reverse: boolean;
  reversed_at: string | Date | null;
  created_at: string | Date;
  updated_at: string | Date | null;
  vas_products: {
    product_name: string;
    product_code: string;
  } | null;
  vas_provider_accounts: {
    account_name: string;
  } | null;
  // Add other properties from vas_transactions model if they are used
}

interface TransactionTableProps {
  transactions: TransactionTableItem[]; // Use the new interface
  isLoading: boolean;
  isFetching: boolean;
  error: Error | null;
  currentPage: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
}

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


export const TransactionTable = ({
  transactions,
  isLoading,
  isFetching,
  error,
  currentPage,
  totalPages,
  total,
  onPageChange,
}: TransactionTableProps) => {
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleRowClick = (transactionId: string) => {
    setSelectedTransactionId(transactionId);
    setIsModalOpen(true);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative rounded-md border">
            <TableOverlayLoader isVisible={isLoading} />
            <div className="w-full overflow-x-auto">
              <Table className="min-w-[720px] text-xs sm:text-sm">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[140px]">Date</TableHead>
                    <TableHead className="w-[120px]">Product</TableHead>
                    <TableHead className="w-[120px]">Beneficiary</TableHead>
                    <TableHead className="w-[100px]">Amount</TableHead>
                    <TableHead className="w-[100px]">Status</TableHead>
                    <TableHead className="w-[180px]">Reference</TableHead>
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
                  ) : error ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-destructive py-8">
                        <div>
                          <p>Error loading transactions. Please try again.</p>
                          <p className="text-xs mt-2">{error instanceof Error ? error.message : String(error)}</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : transactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        No transactions found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    transactions.map((tx: TransactionTableItem) => (
                      <TableRow
                        key={tx.id}
                        className="hover:bg-muted/50 cursor-pointer"
                        onClick={() => handleRowClick(tx.id)}
                      >
                        <TableCell className="text-sm">{formatDateTime(tx.created_at)}</TableCell>
                        <TableCell>
                          <div className="text-sm font-medium">{tx.vas_products?.product_name || "N/A"}</div>
                          <div className="text-xs text-muted-foreground">{tx.vas_products?.product_code || ""}</div>
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
          </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Showing page {currentPage} of {totalPages} ({total} total transactions)
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1 || isFetching}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= totalPages || isFetching}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>

    <TransactionDetailModal
      transactionId={selectedTransactionId}
      open={isModalOpen}
      onOpenChange={setIsModalOpen}
    />
    </>
  );
};

