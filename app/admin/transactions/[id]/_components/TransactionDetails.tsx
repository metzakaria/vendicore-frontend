"use client";

import { ArrowLeft, Building2, Package, Calendar, Hash, CreditCard, TrendingUp, TrendingDown, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface TransactionDetailsProps {
  transaction: any;
}

export const TransactionDetails = ({ transaction }: TransactionDetailsProps) => {
  const router = useRouter();

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
    }).format(Number(amount));
  };

  const formatDateTime = (date: Date | string | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleString("en-NG", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const getStatusBadge = (status: string, isReverse: boolean) => {
    if (isReverse) {
      return <Badge variant="secondary">Reversed</Badge>;
    }
    switch (status.toLowerCase()) {
      case "success":
      case "completed":
        return <Badge variant="default">Success</Badge>;
      case "pending":
        return <Badge variant="outline">Pending</Badge>;
      case "failed":
      case "error":
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/admin/transactions")}
          >
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
          {getStatusBadge(transaction.status, transaction.is_reverse)}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Transaction Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Hash className="h-5 w-5" />
              Transaction Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Transaction ID</span>
                <Badge variant="outline" className="font-mono text-xs">
                  {transaction.id}
                </Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Merchant Reference</span>
                <Badge variant="outline" className="font-mono text-xs">
                  {transaction.merchant_ref}
                </Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Provider Reference</span>
                <span className="text-sm font-mono">
                  {transaction.provider_ref || "N/A"}
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Status</span>
                {getStatusBadge(transaction.status, transaction.is_reverse)}
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Is Reversed</span>
                <Badge variant={transaction.is_reverse ? "destructive" : "secondary"}>
                  {transaction.is_reverse ? "Yes" : "No"}
                </Badge>
              </div>
              <Separator />
              <div className="flex items-start justify-between">
                <span className="text-sm font-medium text-muted-foreground">Description</span>
                <span className="text-sm text-right max-w-[60%]">{transaction.description}</span>
              </div>
              {transaction.provider_desc && (
                <>
                  <Separator />
                  <div className="flex items-start justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Provider Description</span>
                    <span className="text-sm text-right max-w-[60%]">{transaction.provider_desc}</span>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Financial Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Financial Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Amount</span>
                <span className="text-lg font-bold">{formatCurrency(transaction.amount)}</span>
              </div>
              <Separator />
              {Number(transaction.discount_amount) > 0 && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Discount</span>
                    <span className="text-sm text-green-600">
                      -{formatCurrency(transaction.discount_amount)}
                    </span>
                  </div>
                  <Separator />
                </>
              )}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Balance Before</span>
                <span className="text-sm">{formatCurrency(transaction.balance_before)}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Balance After</span>
                <span className="text-sm font-medium">{formatCurrency(transaction.balance_after)}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Beneficiary Account</span>
                <span className="text-sm font-mono">{transaction.beneficiary_account}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Merchant Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Merchant Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Business Name</span>
                <span className="text-sm font-medium">{transaction.vas_merchants.business_name}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Merchant Code</span>
                <Badge variant="outline" className="font-mono">
                  {transaction.vas_merchants.merchant_code}
                </Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Current Balance</span>
                <span className="text-sm font-medium">{formatCurrency(transaction.vas_merchants.current_balance)}</span>
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
                <span className="text-sm font-medium">{transaction.vas_products.product_name}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Product Code</span>
                <Badge variant="outline" className="font-mono">
                  {transaction.vas_products.product_code}
                </Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Category</span>
                <div className="text-right">
                  <div className="text-sm font-medium">{transaction.vas_product_categories.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {transaction.vas_product_categories.category_code}
                  </div>
                </div>
              </div>
              {transaction.vas_provider_accounts && (
                <>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Provider Account</span>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {transaction.vas_provider_accounts.account_name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {transaction.vas_provider_accounts.vas_providers.provider_code}
                      </div>
                    </div>
                  </div>
                </>
              )}
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
                <span className="text-sm font-medium text-muted-foreground">Last Updated</span>
                <span className="text-sm">{formatDateTime(transaction.updated_at)}</span>
              </div>
              {transaction.is_reverse && transaction.reversed_at && (
                <>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <RotateCcw className="h-4 w-4" />
                      Reversed At
                    </span>
                    <span className="text-sm">{formatDateTime(transaction.reversed_at)}</span>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Related IDs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Hash className="h-5 w-5" />
              Related IDs
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Merchant ID</span>
                <Badge variant="outline" className="font-mono text-xs">
                  {transaction.merchant_id}
                </Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Product ID</span>
                <Badge variant="outline" className="font-mono text-xs">
                  {transaction.product_id}
                </Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Product Category ID</span>
                <Badge variant="outline" className="font-mono text-xs">
                  {transaction.product_category_id}
                </Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Provider Account ID</span>
                <span className="text-sm font-mono">
                  {transaction.provider_account_id || "N/A"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

