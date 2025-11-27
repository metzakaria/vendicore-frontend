"use client";

import { ArrowLeft, Calendar, CreditCard, Package, Building2, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { TransactionStatusBadge } from "../../../_components/TransactionStatusBadge";

interface MerchantTransactionDetailsProps {
  transaction: any;
}

export const MerchantTransactionDetails = ({ transaction }: MerchantTransactionDetailsProps) => {
  const router = useRouter();

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/transactions")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Transaction Details</h2>
            <p className="text-muted-foreground">
              Reference: {transaction.merchant_ref}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <TransactionStatusBadge status={transaction.status} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Transaction Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Transaction Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Transaction ID</span>
                <span className="text-sm font-mono">{transaction.id}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Merchant Reference</span>
                <span className="text-sm font-mono">{transaction.merchant_ref}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Provider Reference</span>
                <span className="text-sm font-mono">{transaction.provider_ref || "N/A"}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Amount</span>
                <span className="text-lg font-bold">{formatCurrency(transaction.amount)}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Discount Amount</span>
                <span className="text-sm">{formatCurrency(transaction.discount_amount)}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Status</span>
                <TransactionStatusBadge status={transaction.status} />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Description</span>
                <span className="text-sm text-right max-w-[200px]">{transaction.description}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Product Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Product Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Product Name</span>
                <span className="text-sm font-medium">{transaction.vas_products?.product_name || "N/A"}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Product Code</span>
                <Badge variant="outline" className="font-mono">
                  {transaction.vas_products?.product_code || "N/A"}
                </Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Category</span>
                <span className="text-sm">{transaction.vas_product_categories?.category_name || "N/A"}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Beneficiary Account</span>
                <span className="text-sm font-mono">{transaction.beneficiary_account}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Provider Account</span>
                <span className="text-sm">{transaction.vas_provider_accounts?.account_name || "N/A"}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Balance Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Balance Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Balance Before</span>
                <span className="text-sm">{formatCurrency(transaction.balance_before)}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Transaction Amount</span>
                <span className="text-sm font-medium">{formatCurrency(transaction.amount)}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Balance After</span>
                <span className="text-lg font-bold">{formatCurrency(transaction.balance_after)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timestamps */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Timestamps
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Created At</span>
                <span className="text-sm">{formatDateTime(transaction.created_at)}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Updated At</span>
                <span className="text-sm">{formatDateTime(transaction.updated_at)}</span>
              </div>
              {transaction.reversed_at && (
                <>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Reversed At</span>
                    <span className="text-sm">{formatDateTime(transaction.reversed_at)}</span>
                  </div>
                </>
              )}
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Is Reversed</span>
                <Badge variant={transaction.is_reverse ? "destructive" : "secondary"}>
                  {transaction.is_reverse ? "Yes" : "No"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Provider Information */}
        {transaction.provider_desc && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Provider Response
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{transaction.provider_desc}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

