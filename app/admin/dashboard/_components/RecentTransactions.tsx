"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { getRecentTransactions } from "../_actions/getRecentTransactions";

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "success":
      return "bg-green-500/10 text-green-700 dark:text-green-400";
    case "failed":
      return "bg-red-500/10 text-red-700 dark:text-red-400";
    case "pending":
      return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400";
    default:
      return "bg-gray-500/10 text-gray-700 dark:text-gray-400";
  }
};

export const RecentTransactions = () => {
  const { data: transactions, isLoading } = useQuery({
    queryKey: ["admin-recent-transactions"],
    queryFn: () => getRecentTransactions(),
    staleTime: 30000,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : !transactions || transactions.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No transactions found
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Merchant</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id.toString()}>
                  <TableCell className="font-medium">
                    {transaction.vas_merchants?.business_name || "N/A"}
                  </TableCell>
                  <TableCell>
                    {transaction.vas_products?.product_name || "N/A"}
                  </TableCell>
                  <TableCell>
                    {new Intl.NumberFormat("en-NG", {
                      style: "currency",
                      currency: "NGN",
                    }).format(Number(transaction.amount))}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={getStatusColor(transaction.status)}
                    >
                      {transaction.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {transaction.created_at
                      ? format(new Date(transaction.created_at), "MMM dd, HH:mm")
                      : "N/A"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};
