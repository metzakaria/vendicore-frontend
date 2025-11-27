"use client";

import { useState } from "react";
import { ArrowLeft, Building2, Calendar, Hash, CreditCard, CheckCircle2, XCircle, Edit, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { approveFunding } from "../../_actions/approveFunding";
import { rejectFunding } from "../../_actions/rejectFunding";
import { updateFundingAmount } from "../../_actions/updateFundingAmount";
import { useQueryClient } from "@tanstack/react-query";

interface FundingDetailsProps {
  funding: any;
}

export const FundingDetails = ({ funding }: FundingDetailsProps) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editAmount, setEditAmount] = useState(funding.amount);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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

  const canEdit = !funding.is_approved && !funding.is_credited && funding.is_active;

  const handleUpdateAmount = async () => {
    if (Number(editAmount) <= 0) {
      setError("Amount must be greater than 0");
      return;
    }

    setIsUpdating(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await updateFundingAmount(funding.funding_ref, editAmount);
      if (result.success) {
        setSuccess("Funding amount updated successfully");
        setIsEditing(false);
        queryClient.invalidateQueries({ queryKey: ["funding-requests"] });
        // Reload page to get updated data
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        setError(result.error || "Failed to update funding amount");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while updating the amount");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleApprove = async () => {
    setIsApproving(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await approveFunding(funding.funding_ref);
      if (result.success) {
        setSuccess("Funding request approved and credited successfully");
        queryClient.invalidateQueries({ queryKey: ["funding-requests"] });
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        setError(result.error || "Failed to approve funding request");
        setIsApproving(false);
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while approving the funding");
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    setIsRejecting(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await rejectFunding(funding.funding_ref);
      if (result.success) {
        setSuccess("Funding request rejected successfully");
        queryClient.invalidateQueries({ queryKey: ["funding-requests"] });
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        setError(result.error || "Failed to reject funding request");
        setIsRejecting(false);
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while rejecting the funding");
      setIsRejecting(false);
    }
  };

  const getStatusBadge = () => {
    if (!funding.is_active) {
      return <Badge variant="destructive">Rejected</Badge>;
    }
    if (funding.is_approved && funding.is_credited) {
      return <Badge variant="default">Approved & Credited</Badge>;
    }
    if (funding.is_approved) {
      return <Badge variant="default">Approved</Badge>;
    }
    return <Badge variant="outline">Pending</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/admin/funding")}
          >
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
          {canEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              disabled={isUpdating}
            >
              <Edit className="mr-2 h-4 w-4" />
              {isEditing ? "Cancel" : "Edit Amount"}
            </Button>
          )}
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {/* Funding Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Hash className="h-5 w-5" />
              Funding Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Funding Reference</span>
                <Badge variant="outline" className="font-mono text-xs">
                  {funding.funding_ref}
                </Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Amount</span>
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={editAmount}
                      onChange={(e) => setEditAmount(e.target.value)}
                      className="w-[150px]"
                      disabled={isUpdating}
                    />
                    <Button
                      size="sm"
                      onClick={handleUpdateAmount}
                      disabled={isUpdating}
                    >
                      {isUpdating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save"
                      )}
                    </Button>
                  </div>
                ) : (
                  <span className="text-lg font-bold">{formatCurrency(funding.amount)}</span>
                )}
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Description</span>
                <span className="text-sm text-right max-w-[60%]">{funding.description}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Source</span>
                <span className="text-sm">{funding.source}</span>
              </div>
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
                <span className="text-sm font-medium text-muted-foreground">Balance Before</span>
                <span className="text-sm">{formatCurrency(funding.balance_before)}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Funding Amount</span>
                <span className="text-sm font-semibold">{formatCurrency(funding.amount)}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Balance After</span>
                <span className="text-lg font-bold">{formatCurrency(funding.balance_after)}</span>
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
                <span className="text-sm font-medium">{funding.vas_merchants.business_name}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Merchant Code</span>
                <Badge variant="outline" className="font-mono">
                  {funding.vas_merchants.merchant_code}
                </Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Current Balance</span>
                <span className="text-sm font-medium">{formatCurrency(funding.vas_merchants.current_balance)}</span>
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
                <span className="text-sm">{funding.vas_users_vas_merchant_funding_created_byTovas_users.username}</span>
              </div>
              {funding.approved_at && (
                <>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Approved At</span>
                    <span className="text-sm">{formatDateTime(funding.approved_at)}</span>
                  </div>
                  {funding.vas_users_vas_merchant_funding_approved_byTovas_users && (
                    <>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-muted-foreground">Approved By</span>
                        <span className="text-sm">{funding.vas_users_vas_merchant_funding_approved_byTovas_users.username}</span>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>

            {/* Action Buttons */}
            {canEdit && (
              <>
                <Separator />
                <div className="flex flex-col gap-2 pt-2">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        className="w-full"
                        disabled={isApproving || isRejecting}
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Approve & Credit
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Approve Funding Request?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will approve the funding request and credit {formatCurrency(funding.amount)} to{" "}
                          <strong>{funding.vas_merchants.business_name}</strong>. The merchant's balance will be updated from{" "}
                          {formatCurrency(funding.balance_before)} to {formatCurrency(funding.balance_after)}.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel disabled={isApproving}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleApprove}
                          disabled={isApproving}
                          className="bg-primary"
                        >
                          {isApproving ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Approving...
                            </>
                          ) : (
                            "Approve"
                          )}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        className="w-full"
                        disabled={isApproving || isRejecting}
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Reject
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Reject Funding Request?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will reject the funding request for{" "}
                          <strong>{funding.vas_merchants.business_name}</strong>. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel disabled={isRejecting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleReject}
                          disabled={isRejecting}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          {isRejecting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Rejecting...
                            </>
                          ) : (
                            "Reject"
                          )}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

