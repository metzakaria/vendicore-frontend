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
import { Calendar, CreditCard, Building2, CheckCircle2, XCircle, Clock, X } from "lucide-react";
import { format } from "date-fns";
import { getMerchantFundingById } from "../_actions/getMerchantFundingById";

// Define a type for the included user details
type UserDetails = {
  id: string;
  username: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
};

// Define the shape of the serialized funding object
interface FundingDetails {
  funding_ref: string;
  amount: string;
  balance_before: string;
  balance_after: string;
  description: string;
  source: string;
  is_approved: boolean;
  is_credited: boolean;
  is_active: boolean;
  created_at: string | Date;
  approved_at: string | Date | null;
  merchant_id: string;
  created_by: string;
  approved_by: string | null;

  vas_merchants: {
    id: string;
    merchant_code: string;
    business_name: string;
    current_balance: string;
  } | null; // vas_merchants can be null based on getMerchantFundingById
  vas_users_vas_merchant_funding_created_byTovas_users: UserDetails | null;
  vas_users_vas_merchant_funding_approved_byTovas_users: UserDetails | null;
}

interface FundingDetailModalProps {
  fundingId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const FundingDetailModal = ({
  fundingId,
  open,
  onOpenChange,
}: FundingDetailModalProps) => {
  const { data: funding, isLoading, error } = useQuery<FundingDetails | null, Error>({ // Specify type parameters for useQuery
    queryKey: ["merchant-funding", fundingId],
    queryFn: () => getMerchantFundingById(fundingId!),
    enabled: !!fundingId && open,
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

  const getStatusBadge = () => {
    if (!funding) return null;
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
        <Badge variant="default" className="flex items-center gap-1 w-fit bg-green-500 hover:bg-green-600 text-white border-green-500">
          <CheckCircle2 className="h-3 w-3" />
          Approved
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="flex items-center gap-1 w-fit bg-blue-500 hover:bg-blue-600 text-white border-blue-500">
        <Clock className="h-3 w-3" />
        Pending
      </Badge>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0" showCloseButton={false}>
        <DialogHeader className="sticky top-0 z-10 bg-background border-b px-6 py-4 flex flex-row items-center justify-between">
          <DialogTitle>
            Funding Request Details
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
              <p className="text-sm">Error loading funding details. Please try again.</p>
            </div>
          ) : !funding ? (
            <div className="text-center text-muted-foreground py-6">
              <p className="text-sm">Funding request not found.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Key Information - Highlighted */}
              <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Amount</span>
                  <span className="text-2xl font-bold">{formatCurrency(funding.amount)}</span>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-muted-foreground">Reference</span>
                    <p className="text-sm font-mono mt-1">{funding.funding_ref}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Source</span>
                    <p className="text-sm capitalize mt-1">{funding.source}</p>
                  </div>
                </div>
              </div>

              {/* Funding Details */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Funding Details
                </h3>
                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between py-1.5 border-b">
                    <span className="text-muted-foreground">Status</span>
                    {getStatusBadge()}
                  </div>
                  <div className="flex justify-between py-1.5 border-b">
                    <span className="text-muted-foreground">Is Credited</span>
                    <Badge variant={funding.is_credited ? "default" : "secondary"} className="text-xs">
                      {funding.is_credited ? "Yes" : "No"}
                    </Badge>
                  </div>
                  <div className="flex justify-between py-1.5 border-b">
                    <span className="text-muted-foreground">Description</span>
                    <span className="text-right max-w-[60%]">{funding.description || "N/A"}</span>
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
                    <span>{formatCurrency(funding.balance_before)}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b">
                    <span className="text-muted-foreground">Funding Amount</span>
                    <span className="font-medium">{formatCurrency(funding.amount)}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b">
                    <span className="text-muted-foreground">Balance After</span>
                    <span className="font-bold">{formatCurrency(funding.balance_after)}</span>
                  </div>
                </div>
              </div>

              {/* Merchant Information */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Merchant Information
                </h3>
                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between py-1.5 border-b">
                    <span className="text-muted-foreground">Business Name</span>
                    <span className="font-medium">{funding.vas_merchants?.business_name || "N/A"}</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-muted-foreground">Merchant Code</span>
                    <Badge variant="outline" className="font-mono text-xs">
                      {funding.vas_merchants?.merchant_code || "N/A"}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Timestamps & Actions */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Timestamps & Actions
                </h3>
                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between py-1.5 border-b">
                    <span className="text-muted-foreground">Created At</span>
                    <span>{formatDateTime(funding.created_at)}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b">
                    <span className="text-muted-foreground">Created By</span>
                    <span>{funding.vas_users_vas_merchant_funding_created_byTovas_users?.username || "N/A"}</span>
                  </div>
                  {funding.approved_at && (
                    <div className="flex justify-between py-1.5 border-b">
                      <span className="text-muted-foreground">Approved At</span>
                      <span>{formatDateTime(funding.approved_at)}</span>
                    </div>
                  )}
                  {funding.vas_users_vas_merchant_funding_approved_byTovas_users && (
                    <div className="flex justify-between py-1.5">
                      <span className="text-muted-foreground">Approved By</span>
                      <span>{funding.vas_users_vas_merchant_funding_approved_byTovas_users.username}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
