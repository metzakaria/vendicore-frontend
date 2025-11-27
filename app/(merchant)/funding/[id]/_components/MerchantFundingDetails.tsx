"use client";

import { ArrowLeft, Calendar, CreditCard, Building2, User, CheckCircle2, XCircle, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";

interface MerchantFundingDetailsProps {
  funding: any;
}

export const MerchantFundingDetails = ({ funding }: MerchantFundingDetailsProps) => {
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

  const getStatusBadge = () => {
    if (!funding.is_active) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1 w-fit">
          <XCircle className="h-3 w-3" />
          Rejected
        </Badge>
      );
    }
    if (funding.is_approved) {
      return (
        <Badge variant="default" className="flex items-center gap-1 w-fit">
          <CheckCircle2 className="h-3 w-3" />
          Approved
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="flex items-center gap-1 w-fit">
        <Clock className="h-3 w-3" />
        Pending
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/funding")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Funding Request Details</h2>
            <p className="text-muted-foreground">
              Reference: {funding.funding_ref}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge()}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Funding Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Funding Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Reference</span>
                <Badge variant="outline" className="font-mono">{funding.funding_ref}</Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Amount</span>
                <span className="text-lg font-bold">{formatCurrency(funding.amount)}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Source</span>
                <span className="text-sm capitalize">{funding.source}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Status</span>
                {getStatusBadge()}
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Is Credited</span>
                <Badge variant={funding.is_credited ? "default" : "secondary"}>
                  {funding.is_credited ? "Yes" : "No"}
                </Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Description</span>
                <span className="text-sm text-right max-w-[200px]">{funding.description || "N/A"}</span>
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
                <span className="text-sm">{formatCurrency(funding.balance_before)}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Funding Amount</span>
                <span className="text-sm font-medium">{formatCurrency(funding.amount)}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Balance After</span>
                <span className="text-lg font-bold text-primary">{formatCurrency(funding.balance_after)}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Current Balance</span>
                <span className="text-lg font-bold">{formatCurrency(funding.vas_merchants?.current_balance || "0")}</span>
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
                <span className="text-sm font-medium">{funding.vas_merchants?.business_name || "N/A"}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Merchant Code</span>
                <Badge variant="outline" className="font-mono">
                  {funding.vas_merchants?.merchant_code || "N/A"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timestamps & Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Timestamps & Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Created At</span>
                <span className="text-sm">{formatDateTime(funding.created_at)}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Created By</span>
                <span className="text-sm">
                  {funding.vas_users_vas_merchant_funding_created_byTovas_users?.username || "N/A"}
                </span>
              </div>
              {funding.approved_at && (
                <>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Approved At</span>
                    <span className="text-sm">{formatDateTime(funding.approved_at)}</span>
                  </div>
                </>
              )}
              {funding.vas_users_vas_merchant_funding_approved_byTovas_users && (
                <>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Approved By</span>
                    <span className="text-sm">
                      {funding.vas_users_vas_merchant_funding_approved_byTovas_users.username}
                    </span>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

