"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft, Building2, CreditCard } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

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
import { 
  createFundingSchema,
  type CreateFundingFormData,
} from "@/lib/validations/funding";
import { createFunding } from "../../_actions/createFunding";
import { getMerchantsForDropdown } from "../../_actions/getMerchantsForDropdown";

export const CreateFundingForm = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoApprove, setAutoApprove] = useState(false);

  // Fetch merchants for dropdown
  const { data: merchants, isLoading: merchantsLoading } = useQuery({
    queryKey: ["merchants-dropdown"],
    queryFn: () => getMerchantsForDropdown(),
    staleTime: 300000,
  });

  const form = useForm<CreateFundingFormData>({
    resolver: zodResolver(createFundingSchema),
    defaultValues: {
      merchant_id: "",
      amount: "",
      description: "",
      source: "Manual",
    },
  });

  const selectedMerchantId = form.watch("merchant_id");
  const selectedMerchant = merchants?.find((m) => m.id === selectedMerchantId);

  const onSubmit = async (data: CreateFundingFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await createFunding(data);
      if (result.success && result.funding) {
        if (autoApprove) {
          // Navigate to details page where they can approve
          router.push(`/admin/funding/${result.funding.funding_ref}`);
        } else {
          router.push(`/admin/funding/${result.funding.funding_ref}`);
        }
      } else {
        setError(result.error || "Failed to create funding request");
      }
    } catch (err: any) {
      setError(
        err.message || "An error occurred while creating the funding request"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push("/admin/funding");
  };

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        onClick={handleCancel}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Funding
      </Button>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <Alert variant="destructive" role="alert" aria-live="polite">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            {/* Merchant Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Merchant Selection
                </CardTitle>
                <CardDescription>
                  Select the merchant to fund
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="merchant_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Merchant *</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value}
                        disabled={merchantsLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a merchant" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {merchantsLoading ? (
                            <SelectItem value="loading" disabled>Loading merchants...</SelectItem>
                          ) : merchants && merchants.length > 0 ? (
                            merchants.map((merchant) => (
                              <SelectItem key={merchant.id} value={merchant.id}>
                                {merchant.business_name} ({merchant.merchant_code})
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="none" disabled>No merchants available</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Select the merchant to add funding for
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {selectedMerchant && (
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      <div>
                        <div className="font-medium">{selectedMerchant.business_name}</div>
                        <div className="text-xs text-muted-foreground">
                          Code: {selectedMerchant.merchant_code}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Funding Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Funding Details
                </CardTitle>
                <CardDescription>
                  Enter the funding amount and details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="10000.00"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Enter the funding amount in NGN
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="source"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Source *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select source" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Manual">Manual</SelectItem>
                          <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                          <SelectItem value="Card Payment">Card Payment</SelectItem>
                          <SelectItem value="Cash Deposit">Cash Deposit</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Select the funding source
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
              <CardDescription>
                Provide a description for this funding request
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter funding description..."
                        className="resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Describe the purpose or reason for this funding
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex items-center justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || merchantsLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Funding Request"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

