"use client";

import { ArrowLeft, Building2, Wallet, Activity, User, MapPin, Globe, Calendar, Key, Shield, Hash, CreditCard, TrendingUp, Clock, Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MerchantInfoCards } from "./MerchantInfoCards";
import { MerchantFunding } from "./MerchantFunding";
import { MerchantDiscounts } from "./MerchantDiscounts";

interface MerchantDetailsProps {
  merchant: any;
}

export const MerchantDetails = ({ merchant }: MerchantDetailsProps) => {
  const router = useRouter();

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
    }).format(Number(amount));
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-NG", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (date: Date | string | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleString("en-NG", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/admin/merchants")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">{merchant.business_name}</h2>
            <p className="text-muted-foreground">
              Merchant Code: {merchant.merchant_code}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Status:</span>
          <Badge
            className={
              merchant.is_active
                ? "bg-green-500 text-white hover:bg-green-600 rounded-md px-3 py-1 font-medium"
                : "bg-gray-500 text-white hover:bg-gray-600 rounded-md px-3 py-1 font-medium"
            }
          >
            {merchant.is_active ? "ACTIVE" : "INACTIVE"}
          </Badge>
        </div>
      </div>

      {/* Balance Section */}
      <div className="border-b-1 border-gray-200 px-2"></div>
      

      {/* Tabs */}
      <Tabs defaultValue="details" className="w-full">
        <TabsList className="h-auto bg-transparent p-0 border-0 rounded-none gap-0">
          <TabsTrigger 
            value="details"
            className="data-[state=active]:bg-transparent border-0  data-[state=active]:shadow-none data-[state=active]:border-b-[4px] data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 rounded-none border-b-[3px] border-transparent px-6 py-3 text-muted-foreground font-medium transition-all"
          >
            Merchant Info
          </TabsTrigger>
          <TabsTrigger 
            value="funding"
            className="data-[state=active]:bg-transparent  border-0  data-[state=active]:shadow-none data-[state=active]:border-b-[4px] data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 rounded-none border-b-[3px] border-transparent px-6 py-3 text-muted-foreground font-medium transition-all"
          >
            Funding
          </TabsTrigger>
          <TabsTrigger 
            value="discounts"
            className="data-[state=active]:bg-transparent  border-0  data-[state=active]:shadow-none data-[state=active]:border-b-[4px] data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 rounded-none border-b-[3px] border-transparent px-6 py-3 text-muted-foreground font-medium transition-all"
          >
            Discounts
          </TabsTrigger>
        </TabsList>

                <TabsContent value="details" className="space-y-6 mt-6">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">MERCHANT DETAIL</CardTitle>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/admin/merchants/${merchant.id}/edit`)}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                      </div>
                    </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <span className="text-xs text-muted-foreground">Merchant ID</span>
                    <p className="text-sm font-medium mt-1">{merchant.id}</p>
                  </div>
                  <Separator className="opacity-30" />
                  <div>
                    <span className="text-xs text-muted-foreground">Merchant Code</span>
                    <p className="text-sm font-medium mt-1">{merchant.merchant_code}</p>
                  </div>
                  {merchant.user_id && (
                    <>
                      <Separator className="opacity-30" />
                      <div>
                        <span className="text-xs text-muted-foreground">User ID</span>
                        <p className="text-sm font-medium mt-1">{merchant.user_id}</p>
                      </div>
                    </>
                  )}
                  <Separator className="opacity-30" />
                  <div>
                    <span className="text-xs text-muted-foreground">Business Name</span>
                    <p className="text-sm font-medium mt-1">{merchant.business_name}</p>
                  </div>
                  {merchant.business_description && (
                    <>
                      <Separator className="opacity-30" />
                      <div>
                        <span className="text-xs text-muted-foreground">Description</span>
                        <p className="text-sm font-medium mt-1">{merchant.business_description}</p>
                      </div>
                    </>
                  )}
                  <Separator className="opacity-30" />
                  <div>
                    <span className="text-xs text-muted-foreground">Account Type</span>
                    <p className="text-sm font-medium mt-1">{merchant.account_type}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {merchant.website && (
                    <>
                      <div>
                        <span className="text-xs text-muted-foreground">Website</span>
                        <p className="text-sm font-medium mt-1">
                          <a href={merchant.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                            {merchant.website}
                          </a>
                        </p>
                      </div>
                      <Separator className="opacity-30" />
                    </>
                  )}
                  <div>
                    <span className="text-xs text-muted-foreground">Address</span>
                    <p className="text-sm font-medium mt-1">{merchant.address || "N/A"}</p>
                  </div>
                  <Separator className="opacity-30" />
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs text-muted-foreground">City</span>
                      <p className="text-sm font-medium mt-1">{merchant.city || "N/A"}</p>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">State</span>
                      <p className="text-sm font-medium mt-1">{merchant.state || "N/A"}</p>
                    </div>
                  </div>
                  <Separator className="opacity-30" />
                  <div>
                    <span className="text-xs text-muted-foreground">Country</span>
                    <p className="text-sm font-medium mt-1">{merchant.country || "N/A"}</p>
                  </div>
                  <Separator className="opacity-30" />
                  <div>
                    <span className="text-xs text-muted-foreground">Daily Transaction Limit</span>
                    <p className="text-sm font-medium mt-1">{merchant.daily_tranx_limit || "N/A"}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {merchant.vas_users && (
            <Card>
              <CardHeader>
                <CardTitle className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">USER ACCOUNT</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-4">
                    <div>
                      <span className="text-xs text-muted-foreground">Email</span>
                      <p className="text-sm font-medium mt-1">{merchant.vas_users.email}</p>
                    </div>
                    <Separator className="opacity-50" />
                    <div>
                      <span className="text-xs text-muted-foreground">Username</span>
                      <p className="text-sm font-medium mt-1">{merchant.vas_users.username}</p>
                    </div>
                    {(merchant.vas_users.first_name || merchant.vas_users.last_name) && (
                      <>
                        <Separator className="opacity-50" />
                        <div>
                          <span className="text-xs text-muted-foreground">Full Name</span>
                          <p className="text-sm font-medium mt-1">
                            {`${merchant.vas_users.first_name || ""} ${merchant.vas_users.last_name || ""}`.trim() || "N/A"}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="space-y-4">
                    {merchant.vas_users.phone_number && (
                      <>
                        <div>
                          <span className="text-xs text-muted-foreground">Phone</span>
                          <p className="text-sm font-medium mt-1">{merchant.vas_users.phone_number}</p>
                        </div>
                        <Separator className="opacity-50" />
                      </>
                    )}
                    <div>
                      <span className="text-xs text-muted-foreground">Status</span>
                      <div className="mt-1">
                        <Badge
                          variant={merchant.vas_users.is_active ? "default" : "secondary"}
                          className={
                            merchant.vas_users.is_active
                              ? "bg-green-500/10 text-green-700 dark:text-green-400"
                              : "bg-gray-500/10 text-gray-700 dark:text-gray-400"
                          }
                        >
                          {merchant.vas_users.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                    {merchant.vas_users.date_joined && (
                      <>
                        <Separator className="opacity-50" />
                        <div>
                          <span className="text-xs text-muted-foreground">Date Joined</span>
                          <p className="text-sm font-medium mt-1">{formatDateTime(merchant.vas_users.date_joined)}</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">API CREDENTIALS</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <span className="text-xs text-muted-foreground">API Token</span>
                    <p className="text-sm font-mono mt-1 break-all">
                      {merchant.api_token ? `${merchant.api_token.substring(0, 30)}...` : "N/A"}
                    </p>
                  </div>
                  <Separator className="opacity-50" />
                  <div>
                    <span className="text-xs text-muted-foreground">Secret Key</span>
                    <p className="text-sm font-mono mt-1 break-all">
                      {merchant.api_secret_key ? `${merchant.api_secret_key.substring(0, 30)}...` : "N/A"}
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <span className="text-xs text-muted-foreground">Allowed IP</span>
                    <p className="text-sm font-medium mt-1">{merchant.api_access_ip || "N/A"}</p>
                  </div>
                  <Separator className="opacity-50" />
                  <div>
                    <span className="text-xs text-muted-foreground">Token Created</span>
                    <p className="text-sm font-medium mt-1">
                      {merchant.api_token_created ? formatDateTime(merchant.api_token_created) : "N/A"}
                    </p>
                  </div>
                  <Separator className="opacity-50" />
                  <div>
                    <span className="text-xs text-muted-foreground">Token Expires</span>
                    <p className="text-sm font-medium mt-1">
                      {merchant.api_token_expire ? formatDateTime(merchant.api_token_expire) : "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="funding" className="space-y-4 mt-6">
          <MerchantFunding merchantId={merchant.id} />
        </TabsContent>

        <TabsContent value="discounts" className="space-y-4 mt-6">
          <MerchantDiscounts merchantId={merchant.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

