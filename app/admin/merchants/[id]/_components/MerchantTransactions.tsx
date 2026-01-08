"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity } from "lucide-react";
import { getMerchantTransactions } from "../_actions/getMerchantTransactions";
import { TableOverlayLoader } from "@/components/ui/table-overlay-loader";

interface Transaction {
  id: string;
  merchant_ref: string;
  provider_ref: string | null;
  beneficiary_account: string;
  amount: string;
  status: string;
  created_at: Date | string;
  vas_products: {
    name: string;
    product_code: string;
  } | null;
}

interface TransactionsResponse {
  transactions: Transaction[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const fetchTransactions = async (
  merchantId: string,
  page: number,
  status: string
): Promise<TransactionsResponse> => {
  const result = await getMerchantTransactions({
    merchantId,
    page,
    limit: 10,
    status,
  });

  return {
    transactions: result.transactions as Transaction[],
    total: result.total,
    page: result.page,
    limit: result.limit,
    totalPages: result.totalPages,
  };
};

interface MerchantTransactionsProps {
  merchantId: string;
}

export const MerchantTransactions = ({ merchantId }: MerchantTransactionsProps) => {
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);

  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: ["merchant-transactions", merchantId, page, status],
    queryFn: () => fetchTransactions(merchantId, page, status),
    retry: 1,
    keepPreviousData: true,
  });

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
    }).format(Number(amount));
  };

  const formatDateTime = (date: Date | string) => {
    return new Date(date).toLocaleString("en-NG", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive"; className: string }> = {
      success: {
        variant: "default",
        className: "bg-green-500/10 text-green-700 dark:text-green-400",
      },
      failed: {
        variant: "destructive",
        className: "bg-red-500/10 text-red-700 dark:text-red-400",
      },
      pending: {
        variant: "secondary",
        className: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
      },
    };

    const config = variants[status.toLowerCase()] || {
      variant: "secondary" as const,
      className: "bg-gray-500/10 text-gray-700 dark:text-gray-400",
    };

    return (
      <Badge variant={config.variant} className={config.className}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  const transactions = data?.transactions || [];
  const totalPages = data?.totalPages || 1;
  const currentPage = data?.page || page;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Transactions
          </CardTitle>
          <Select value={status} onValueChange={(value) => {
            setStatus(value);
            setPage(1);
          }}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="success">Success</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border relative">
          <TableOverlayLoader isVisible={isLoading} />
          {isFetching && !isLoading && (
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary/20 z-10">
              <div className="h-full bg-primary animate-pulse" style={{ width: "30%" }} />
            </div>
          )}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reference</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Beneficiary</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && !data ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  </TableRow>
                ))
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <p className="text-destructive mb-2">Error loading transactions</p>
                    <p className="text-sm text-muted-foreground">
                      {error instanceof Error ? error.message : "Please try again"}
                    </p>
                  </TableCell>
                </TableRow>
              ) : transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No transactions found
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-mono text-xs">
                      {transaction.merchant_ref}
                    </TableCell>
                    <TableCell>
                      {transaction.vas_products?.name || "N/A"}
                      {transaction.vas_products?.product_code && (
                        <span className="text-xs text-muted-foreground block">
                          {transaction.vas_products.product_code}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>{transaction.beneficiary_account}</TableCell>
                    <TableCell>{formatCurrency(transaction.amount)}</TableCell>
                    <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDateTime(transaction.created_at)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * 10 + 1} to{" "}
              {Math.min(currentPage * 10, data?.total || 0)} of {data?.total || 0} transactions
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(currentPage - 1)}
                disabled={currentPage === 1 || isFetching}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(currentPage + 1)}
                disabled={currentPage >= totalPages || isFetching}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

