"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, CreditCard, Package, Building2, User, X } from "lucide-react";
import { format } from "date-fns";
import { getMerchantTransactionById } from "../_actions/getMerchantTransactionById";
import { TransactionStatusBadge } from "../../_components/TransactionStatusBadge";

interface TransactionDetailModalProps {
  transactionId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TransactionDetailModal = ({
  transactionId,
  open,
  onOpenChange,
}: TransactionDetailModalProps) => {
  const { data: transaction, isLoading, error } = useQuery({
    queryKey: ["merchant-transaction", transactionId],
    queryFn: () => getMerchantTransactionById(transactionId!),
    enabled: !!transactionId && open,
    staleTime: 30000,
  });

  const formatCurrency = (amount: string) => {
    return `₦${new Intl.NumberFormat("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(amount))}`;
  };

  const formatDateTime = (date: string | Date | null) => {
    if (!date) return "N/A";
    return format(new Date(date), "MMM dd, yyyy HH:mm:ss");
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0" showCloseButton={false}>
        <DialogHeader className="sticky top-0 z-10 bg-background border-b px-6 py-4 flex flex-row items-center justify-between">
          <DialogTitle>
            Transaction Details
          </DialogTitle>
          <DialogClose asChild>
            <button className="rounded-full p-1.5 opacity-70 ring-offset-background transition-opacity hover:opacity-100 hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none cursor-pointer">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>
          </DialogClose>
        </DialogHeader>
        <div className="overflow-y-auto flex-1 px-6 py-4">

          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : error ? (
            <div className="text-center text-destructive py-6">
              <p className="text-sm">Error loading transaction details. Please try again.</p>
            </div>
          ) : !transaction ? (
            <div className="text-center text-muted-foreground py-6">
              <p className="text-sm">Transaction not found.</p>
            </div>
          ) : (
            <div className="space-y-4">
            {/* Key Information - Highlighted */}
            <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Amount</span>
                <span className="text-2xl font-bold">{formatCurrency(transaction.amount)}</span>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-muted-foreground">Merchant Reference</span>
                  <p className="text-sm font-mono mt-1">{transaction.merchant_ref}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Provider Reference</span>
                  <p className="text-sm font-mono mt-1">{transaction.provider_ref || "N/A"}</p>
                </div>
              </div>
            </div>

            {/* Transaction Details */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Transaction Details
              </h3>
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between py-1.5 border-b">
                  <span className="text-muted-foreground">Status</span>
                  <TransactionStatusBadge status={transaction.status} />
                </div>
                <div className="flex justify-between py-1.5 border-b">
                  <span className="text-muted-foreground">Transaction ID</span>
                  <span className="font-mono">{transaction.id}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b">
                  <span className="text-muted-foreground">Discount Amount</span>
                  <span>{formatCurrency(transaction.discount_amount)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b">
                  <span className="text-muted-foreground">Description</span>
                  <span className="text-right max-w-[60%]">{transaction.description}</span>
                </div>
              </div>
            </div>

            {/* Product Information */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Package className="h-4 w-4" />
                Product Information
              </h3>
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between py-1.5 border-b">
                  <span className="text-muted-foreground">Product Name</span>
                  <span className="font-medium">{transaction.vas_products?.product_name || "N/A"}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b">
                  <span className="text-muted-foreground">Product Code</span>
                  <Badge variant="outline" className="font-mono text-xs">
                    {transaction.vas_products?.product_code || "N/A"}
                  </Badge>
                </div>
                <div className="flex justify-between py-1.5 border-b">
                  <span className="text-muted-foreground">Category</span>
                  <span>{transaction.vas_product_categories?.name || "N/A"}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b">
                  <span className="text-muted-foreground">Beneficiary Account</span>
                  <span className="font-mono">{transaction.beneficiary_account}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b">
                  <span className="text-muted-foreground">Provider Account</span>
                  <span>{transaction.vas_provider_accounts?.account_name || "N/A"}</span>
                </div>
              </div>
            </div>

            {/* Balance Information */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Balance Information
              </h3>
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between py-1.5 border-b">
                  <span className="text-muted-foreground">Balance Before</span>
                  <span>{formatCurrency(transaction.balance_before)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b">
                  <span className="text-muted-foreground">Transaction Amount</span>
                  <span className="font-medium">{formatCurrency(transaction.amount)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b">
                  <span className="text-muted-foreground">Balance After</span>
                  <span className="font-bold">{formatCurrency(transaction.balance_after)}</span>
                </div>
              </div>
            </div>

            {/* Timestamps */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Timestamps
              </h3>
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between py-1.5 border-b">
                  <span className="text-muted-foreground">Created At</span>
                  <span>{formatDateTime(transaction.created_at)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b">
                  <span className="text-muted-foreground">Updated At</span>
                  <span>{formatDateTime(transaction.updated_at)}</span>
                </div>
                {transaction.reversed_at && (
                  <div className="flex justify-between py-1.5 border-b">
                    <span className="text-muted-foreground">Reversed At</span>
                    <span>{formatDateTime(transaction.reversed_at)}</span>
                  </div>
                )}
                <div className="flex justify-between py-1.5">
                  <span className="text-muted-foreground">Is Reversed</span>
                  <Badge variant={transaction.is_reverse ? "destructive" : "secondary"} className="text-xs">
                    {transaction.is_reverse ? "Yes" : "No"}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Provider Response */}
            {transaction.provider_desc && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Provider Response
                </h3>
                <div className="rounded-lg border bg-muted/30 p-3">
                  <p className="text-sm">{transaction.provider_desc}</p>
                </div>
              </div>
            )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

