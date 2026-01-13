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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Smartphone } from "lucide-react";

interface TransactionTableProps {
  transactions: any[];
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

const MobileTransactionCard = ({ tx, onClick }: { tx: any; onClick: () => void }) => {
  return (
    <div 
      className="bg-card border rounded-lg p-4 mb-3 space-y-2 cursor-pointer hover:bg-accent/50 transition-colors"
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <div>
          <div className="text-sm font-medium truncate max-w-[200px]">
            {tx.vas_products?.product_name || "N/A"}
          </div>
          <div className="text-xs text-muted-foreground">
            {tx.vas_products?.product_code || ""}
          </div>
        </div>
        <div className="text-right">
          <div className="font-semibold">{formatCurrency(tx.amount)}</div>
          <TransactionStatusBadge status={tx.status} showIcon={false} size="sm" />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <div className="text-xs text-muted-foreground">Date</div>
          <div>{formatDateTime(tx.created_at)}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Beneficiary</div>
          <div className="font-mono truncate">{tx.beneficiary_account}</div>
        </div>
      </div>
      
      <div className="pt-2 border-t">
        <div className="text-xs text-muted-foreground">Reference</div>
        <div className="font-mono text-sm truncate">{tx.merchant_ref}</div>
      </div>
    </div>
  );
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
  const [viewMode, setViewMode] = useState<"table" | "mobile">("table");

  const handleRowClick = (transactionId: string) => {
    setSelectedTransactionId(transactionId);
    setIsModalOpen(true);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle>Transaction History</CardTitle>
            <div className="flex items-center gap-2">
              <div className="text-sm text-muted-foreground hidden sm:block">
                Showing {((currentPage - 1) * 20) + 1}-{Math.min(currentPage * 20, total)} of {total} transactions
              </div>
              <div className="sm:hidden">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Smartphone className="h-4 w-4 mr-2" />
                      View
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setViewMode("table")}>
                      Table View
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setViewMode("mobile")}>
                      Card View
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Mobile Card View */}
          <div className="block sm:hidden">
            {viewMode === "mobile" && (
              <div className="space-y-2">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="bg-card border rounded-lg p-4 mb-3 space-y-3">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                      <div className="flex justify-between">
                        <Skeleton className="h-3 w-1/3" />
                        <Skeleton className="h-3 w-1/3" />
                      </div>
                    </div>
                  ))
                ) : error ? (
                  <div className="text-center text-destructive py-8">
                    <div>
                      <p>Error loading transactions. Please try again.</p>
                      <p className="text-xs mt-2">{error instanceof Error ? error.message : String(error)}</p>
                    </div>
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    No transactions found.
                  </div>
                ) : (
                  transactions.map((tx: any) => (
                    <MobileTransactionCard 
                      key={tx.id}
                      tx={tx}
                      onClick={() => handleRowClick(tx.id)}
                    />
                  ))
                )}
              </div>
            )}
            
            {/* Mobile Table View (Simplified) */}
            {viewMode === "table" && (
              <div className="overflow-x-auto -mx-2">
                <div className="min-w-full inline-block align-middle">
                  <div className="overflow-hidden">
                    <table className="min-w-full divide-y divide-border">
                      <thead>
                        <tr className="bg-muted/50">
                          <th className="px-2 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Product
                          </th>
                          <th className="px-2 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Amount
                          </th>
                          <th className="px-2 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {isLoading ? (
                          Array.from({ length: 5 }).map((_, i) => (
                            <tr key={i}>
                              <td className="px-2 py-3"><Skeleton className="h-4 w-[80px]" /></td>
                              <td className="px-2 py-3"><Skeleton className="h-4 w-[60px]" /></td>
                              <td className="px-2 py-3"><Skeleton className="h-4 w-[50px]" /></td>
                            </tr>
                          ))
                        ) : error ? (
                          <tr>
                            <td colSpan={3} className="px-2 py-8 text-center text-destructive">
                              Error loading transactions
                            </td>
                          </tr>
                        ) : transactions.length === 0 ? (
                          <tr>
                            <td colSpan={3} className="px-2 py-8 text-center text-muted-foreground">
                              No transactions found.
                            </td>
                          </tr>
                        ) : (
                          transactions.map((tx: any) => (
                            <tr 
                              key={tx.id}
                              className="hover:bg-muted/30 cursor-pointer"
                              onClick={() => handleRowClick(tx.id)}
                            >
                              <td className="px-2 py-3">
                                <div className="text-sm font-medium truncate max-w-[120px]">
                                  {tx.vas_products?.product_name || "N/A"}
                                </div>
                              </td>
                              <td className="px-2 py-3 text-sm font-medium">
                                {formatCurrency(tx.amount)}
                              </td>
                              <td className="px-2 py-3">
                                <TransactionStatusBadge status={tx.status} showIcon={false} size="sm" />
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Desktop Table View */}
          <div className="hidden sm:block">
            <div className="rounded-md border">
              <div className="w-full overflow-x-auto">
                <Table className="text-xs sm:text-sm">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[140px]">Date</TableHead>
                      <TableHead className="min-w-[120px]">Product</TableHead>
                      <TableHead className="min-w-[120px]">Beneficiary</TableHead>
                      <TableHead className="min-w-[100px]">Amount</TableHead>
                      <TableHead className="min-w-[100px]">Status</TableHead>
                      <TableHead className="min-w-[180px]">Reference</TableHead>
                      <TableHead className="w-[60px]"></TableHead>
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
                          <TableCell><Skeleton className="h-4 w-[30px]" /></TableCell>
                        </TableRow>
                      ))
                    ) : error ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-destructive py-8">
                          <div>
                            <p>Error loading transactions. Please try again.</p>
                            <p className="text-xs mt-2">{error instanceof Error ? error.message : String(error)}</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : transactions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                          No transactions found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      transactions.map((tx: any) => (
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
                          <TableCell className="text-sm font-mono truncate max-w-[120px]">
                            {tx.beneficiary_account}
                          </TableCell>
                          <TableCell className="text-sm font-medium">{formatCurrency(tx.amount)}</TableCell>
                          <TableCell><TransactionStatusBadge status={tx.status} showIcon={false} /></TableCell>
                          <TableCell className="text-sm font-mono truncate max-w-[180px]">
                            {tx.merchant_ref}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleRowClick(tx.id)}>
                                  View Details
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-4">
              <div className="text-sm text-muted-foreground text-center sm:text-left">
                Page {currentPage} of {totalPages}
                <span className="hidden sm:inline"> ({total} total transactions)</span>
              </div>
              <div className="flex gap-2 justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(currentPage - 1)}
                  disabled={currentPage === 1 || isFetching}
                  className="flex-1 sm:flex-initial"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages || isFetching}
                  className="flex-1 sm:flex-initial"
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