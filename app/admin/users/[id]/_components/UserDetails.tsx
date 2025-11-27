"use client";

import { ArrowLeft, User, Mail, Phone, Calendar, Shield, Building2, Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface UserDetailsProps {
  user: any;
}

export const UserDetails = ({ user }: UserDetailsProps) => {
  const router = useRouter();

  const formatDateTime = (date: Date | string | null) => {
    if (!date) return "Never";
    return new Date(date).toLocaleString("en-NG", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-NG", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getUserRole = () => {
    if (user.is_superuser) return "Superadmin";
    if (user.vas_merchants) return "Merchant";
    if (user.is_staff) return "Admin";
    return "User";
  };

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
    }).format(Number(amount));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/admin/users")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              {user.first_name || user.last_name
                ? `${user.first_name || ""} ${user.last_name || ""}`.trim()
                : user.username}
            </h2>
            <p className="text-muted-foreground">
              @{user.username}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant={
              user.is_superuser
                ? "default"
                : user.vas_merchants
                ? "secondary"
                : "outline"
            }
            className="text-base px-3 py-1"
          >
            {getUserRole()}
          </Badge>
          <Badge variant={user.is_active ? "default" : "secondary"} className="text-base px-3 py-1">
            {user.is_active ? "Active" : "Inactive"}
          </Badge>
          <Button
            variant="outline"
            onClick={() => router.push(`/admin/users/${user.id}/edit`)}
          >
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* User Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              User Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Username</span>
                <Badge variant="outline" className="font-mono">
                  {user.username}
                </Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Email</span>
                <span className="text-sm">{user.email}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">First Name</span>
                <span className="text-sm">{user.first_name || "N/A"}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Last Name</span>
                <span className="text-sm">{user.last_name || "N/A"}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Phone Number</span>
                <span className="text-sm">{user.phone_number || "N/A"}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Account Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Is Superuser</span>
                <Badge variant={user.is_superuser ? "default" : "secondary"}>
                  {user.is_superuser ? "Yes" : "No"}
                </Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Is Staff</span>
                <Badge variant={user.is_staff ? "default" : "secondary"}>
                  {user.is_staff ? "Yes" : "No"}
                </Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Is Active</span>
                <Badge variant={user.is_active ? "default" : "secondary"}>
                  {user.is_active ? "Yes" : "No"}
                </Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Email Verified</span>
                <Badge variant={user.email_verified ? "default" : "secondary"}>
                  {user.email_verified ? "Yes" : "No"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Merchant Information */}
        {user.vas_merchants && (
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
                  <span className="text-sm font-medium">{user.vas_merchants.business_name}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Merchant Code</span>
                  <Badge variant="outline" className="font-mono">
                    {user.vas_merchants.merchant_code}
                  </Badge>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Current Balance</span>
                  <span className="text-sm font-medium">{formatCurrency(user.vas_merchants.current_balance)}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Status</span>
                  <Badge variant={user.vas_merchants.is_active ? "default" : "secondary"}>
                    {user.vas_merchants.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

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
                <span className="text-sm font-medium text-muted-foreground">Date Joined</span>
                <span className="text-sm">{formatDateTime(user.date_joined)}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Last Login</span>
                <span className="text-sm">{formatDateTime(user.last_login)}</span>
              </div>
              {user.email_verified_at && (
                <>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Email Verified At</span>
                    <span className="text-sm">{formatDate(user.email_verified_at)}</span>
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

