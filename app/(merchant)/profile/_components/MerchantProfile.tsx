"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, Mail, Phone, MapPin, Globe, Calendar, Wallet } from "lucide-react";
import { format } from "date-fns";
import { getMerchantProfile } from "../_actions/getMerchantProfile";

export const MerchantProfile = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["merchant-profile"],
    queryFn: async () => {
      const result = await getMerchantProfile();
      if (result.error) {
        throw new Error(result.error);
      }
      return result;
    },
    retry: 1,
    staleTime: 300000,
  });

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

  const merchant = data?.merchant;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-destructive">
            <p>Error loading profile. Please try again.</p>
            <p className="text-xs mt-2">{error instanceof Error ? error.message : String(error)}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!merchant) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            No profile data found.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Profile</h2>
        <p className="text-muted-foreground">
          View your merchant account details
        </p>
      </div>

      {/* Account Balance */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Account Balance</CardTitle>
          <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
            <Wallet className="h-6 w-6 text-indigo-700" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{formatCurrency(merchant.current_balance)}</div>
          <p className="text-xs text-muted-foreground mt-1">Current available balance</p>
        </CardContent>
      </Card>

      {/* Business Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Business Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Business Name</p>
              <p className="text-sm font-semibold mt-1">{merchant.business_name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Merchant Code</p>
              <p className="text-sm font-mono mt-1">{merchant.merchant_code}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Account Type</p>
              <p className="text-sm font-semibold mt-1 capitalize">{merchant.account_type}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Status</p>
              <p className="text-sm font-semibold mt-1">
                {merchant.is_active ? (
                  <span className="text-green-600">Active</span>
                ) : (
                  <span className="text-red-600">Inactive</span>
                )}
              </p>
            </div>
            {merchant.business_description && (
              <div className="md:col-span-2">
                <p className="text-sm font-medium text-muted-foreground">Description</p>
                <p className="text-sm mt-1">{merchant.business_description}</p>
              </div>
            )}
            {merchant.address && (
              <div className="md:col-span-2">
                <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  Address
                </p>
                <p className="text-sm mt-1">{merchant.address}</p>
              </div>
            )}
            {merchant.city && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">City</p>
                <p className="text-sm mt-1">{merchant.city}</p>
              </div>
            )}
            {merchant.state && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">State</p>
                <p className="text-sm mt-1">{merchant.state}</p>
              </div>
            )}
            {merchant.country && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Country</p>
                <p className="text-sm mt-1">{merchant.country}</p>
              </div>
            )}
            {merchant.website && (
              <div>
                <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <Globe className="h-3 w-3" />
                  Website
                </p>
                <a
                  href={merchant.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline mt-1"
                >
                  {merchant.website}
                </a>
              </div>
            )}
            {merchant.daily_tranx_limit && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Daily Transaction Limit</p>
                <p className="text-sm font-semibold mt-1">{merchant.daily_tranx_limit}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* User Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            User Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p className="text-sm font-semibold mt-1 flex items-center gap-1">
                <Mail className="h-3 w-3" />
                {merchant.user.email}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Username</p>
              <p className="text-sm font-mono mt-1">{merchant.user.username}</p>
            </div>
            {merchant.user.first_name && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">First Name</p>
                <p className="text-sm font-semibold mt-1">{merchant.user.first_name}</p>
              </div>
            )}
            {merchant.user.last_name && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Last Name</p>
                <p className="text-sm font-semibold mt-1">{merchant.user.last_name}</p>
              </div>
            )}
            {merchant.user.phone_number && (
              <div>
                <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  Phone Number
                </p>
                <p className="text-sm font-semibold mt-1">{merchant.user.phone_number}</p>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Date Joined
              </p>
              <p className="text-sm mt-1">{formatDateTime(merchant.user.date_joined ?? null)}</p>
            </div>
            {merchant.user.last_login && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Last Login</p>
                <p className="text-sm mt-1">{formatDateTime(merchant.user.last_login ?? null)}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Account Dates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Account Dates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Created At</p>
              <p className="text-sm mt-1">{formatDateTime(merchant.created_at ?? null)}</p>
            </div>
            {merchant.updated_at && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
                <p className="text-sm mt-1">{formatDateTime(merchant.updated_at ?? null)}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

