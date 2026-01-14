"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { 
  createMerchantSchema, 
  updateMerchantSchema,
  type CreateMerchantFormData,
  type UpdateMerchantFormData,
} from "@/lib/validations/merchant";
import { createMerchant } from "../new/_actions/createMerchant";
import { updateMerchant } from "../[id]/edit/_actions/updateMerchant";

interface MerchantFormProps {
  mode: "create" | "edit";
  merchantId?: string;
  initialData?: {
    business_name?: string;
    business_description?: string;
    account_type?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    website?: string;
    email?: string;
    first_name?: string;
    last_name?: string;
    phone_number?: string;
    api_access_ip?: string;
    daily_tranx_limit?: string;
    is_active?: boolean;
  };
}

export const MerchantForm = ({ mode, merchantId, initialData }: MerchantFormProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditMode = mode === "edit";

  const form = useForm<CreateMerchantFormData | UpdateMerchantFormData>({
    resolver: zodResolver(isEditMode ? updateMerchantSchema : createMerchantSchema),
    defaultValues: {
      business_name: initialData?.business_name || "",
      business_description: initialData?.business_description || "",
      account_type: initialData?.account_type || "",
      address: initialData?.address || "",
      city: initialData?.city || "",
      state: initialData?.state || "",
      country: initialData?.country || "",
      website: initialData?.website || "",
      email: initialData?.email || "",
      password: "",
      first_name: initialData?.first_name || "",
      last_name: initialData?.last_name || "",
      phone_number: initialData?.phone_number || "",
      ...(isEditMode ? {} : { initial_balance: "0" }),
      api_access_ip: initialData?.api_access_ip || "",
      daily_tranx_limit: initialData?.daily_tranx_limit || "",
      is_active: initialData?.is_active ?? true,
    },
  });

  const onSubmit = async (data: CreateMerchantFormData | UpdateMerchantFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      if (isEditMode && merchantId) {
        const result = await updateMerchant(merchantId, data as UpdateMerchantFormData);
        if (result.success && result.merchant) {
          router.push("/admin/merchants");
          router.refresh();
        } else {
          setError(result.error || "Failed to update merchant");
        }
      } else {
        const result = await createMerchant(data as CreateMerchantFormData);
        if (result.success && result.merchant) {
          router.push(`/admin/merchants/${result.merchant.id}`);
          router.refresh();
        } else {
          setError(result.error || "Failed to create merchant");
        }
      }
    } catch (err: any) {
      setError(
        err.message ||
        `An error occurred while ${isEditMode ? "updating" : "creating"} the merchant`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (isEditMode && merchantId) {
      router.push(`/admin/merchants/${merchantId}`);
    } else {
      router.push("/admin/merchants");
    }
  };

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        onClick={handleCancel}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        {isEditMode ? "Back to Merchant Details" : "Back to Merchants"}
      </Button>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <Alert variant="destructive" role="alert" aria-live="polite">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            {/* Business Information */}
            <Card>
              <CardHeader>
                <CardTitle>Business Information</CardTitle>
                <CardDescription>
                  {isEditMode ? "Update the merchant's business details" : "Enter the merchant's business details"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 overflow-hidden">
                <FormField
                  control={form.control}
                  name="business_name"
                  render={({ field }) => (
                    <FormItem className="min-w-0">
                      <FormLabel>Business Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Acme Corporation" {...field} className="break-words" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="account_type"
                  render={({ field }) => (
                    <FormItem className="min-w-0">
                      <FormLabel>Account Type *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select account type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="prepaid">Prepaid</SelectItem>
                          <SelectItem value="postpaid">Postpaid</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="business_description"
                  render={({ field }) => (
                    <FormItem className="min-w-0">
                      <FormLabel>Business Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Brief description of the business"
                          className="resize-none break-words"
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem className="min-w-0">
                      <FormLabel>Website</FormLabel>
                      <FormControl>
                        <Input
                          type="url"
                          placeholder="https://example.com"
                          {...field}
                          className="break-words"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Location Information */}
            <Card>
              <CardHeader>
                <CardTitle>Location</CardTitle>
                <CardDescription>
                  Merchant's business location
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 overflow-hidden">
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem className="min-w-0">
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input placeholder="123 Main Street" {...field} className="break-words" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem className="min-w-0">
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input placeholder="Lagos" {...field} className="break-words" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem className="min-w-0">
                        <FormLabel>State</FormLabel>
                        <FormControl>
                          <Input placeholder="Lagos State" {...field} className="break-words" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem className="min-w-0">
                      <FormLabel>Country</FormLabel>
                      <FormControl>
                        <Input placeholder="Nigeria" {...field} className="break-words" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* User Account */}
            <Card>
              <CardHeader>
                <CardTitle>User Account</CardTitle>
                <CardDescription>
                  {isEditMode ? "Update login credentials for the merchant" : "Create login credentials for the merchant"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 overflow-hidden">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="min-w-0">
                      <FormLabel>Email *</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="merchant@example.com"
                          {...field}
                          className="break-words"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="min-w-0">
                      <FormLabel>Password {isEditMode ? "" : "*"}</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder={isEditMode ? "Leave blank to keep current password" : "••••••••"}
                          {...field}
                          className="break-words"
                        />
                      </FormControl>
                      <FormDescription>
                        {isEditMode 
                          ? "Leave blank to keep current password. Minimum 6 characters if changing."
                          : "Minimum 6 characters"
                        }
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="first_name"
                    render={({ field }) => (
                      <FormItem className="min-w-0">
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John" {...field} className="break-words" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="last_name"
                    render={({ field }) => (
                      <FormItem className="min-w-0">
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Doe" {...field} className="break-words" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="phone_number"
                  render={({ field }) => (
                    <FormItem className="min-w-0">
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          placeholder="+234 800 000 0000"
                          {...field}
                          className="break-words"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Settings</CardTitle>
                <CardDescription>
                  Configure merchant settings and limits
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 overflow-hidden">
                {!isEditMode && (
                  <FormField
                    control={form.control}
                    name="initial_balance"
                    render={({ field }) => (
                      <FormItem className="min-w-0">
                        <FormLabel>Initial Balance</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                            className="break-words"
                          />
                        </FormControl>
                        <FormDescription>
                          Starting balance for the merchant account
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="daily_tranx_limit"
                  render={({ field }) => (
                    <FormItem className="min-w-0">
                      <FormLabel>Daily Transaction Limit</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="1000000"
                          {...field}
                          className="break-words"
                        />
                      </FormControl>
                      <FormDescription>
                        Maximum daily transaction value
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="api_access_ip"
                  render={({ field }) => (
                    <FormItem className="min-w-0">
                      <FormLabel>API Access IP</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="192.168.1.1"
                          {...field}
                          className="break-words"
                        />
                      </FormControl>
                      <FormDescription>
                        IP address allowed for API access
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Separator />

                <FormField
                  control={form.control}
                  name="is_active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 min-w-0">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Active Status</FormLabel>
                        <FormDescription>
                          Enable or disable the merchant account
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          <div className="flex items-center justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditMode ? "Updating..." : "Creating..."}
                </>
              ) : (
                isEditMode ? "Update Merchant" : "Create Merchant"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

