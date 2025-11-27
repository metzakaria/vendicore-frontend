"use client";

import { useState, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft, Package, Building2 } from "lucide-react";
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  createDiscountSchema, 
  updateDiscountSchema,
  type CreateDiscountFormData,
  type UpdateDiscountFormData,
} from "@/lib/validations/discount";
import { createDiscount } from "../_actions/createDiscount";
import { updateDiscount } from "../_actions/updateDiscount";
import { getMerchantsForDropdown } from "../_actions/getMerchantsForDropdown";
import { getProductsForMerchant } from "../_actions/getProductsForMerchant";

interface DiscountFormProps {
  mode: "create" | "edit";
  discountId?: string;
  initialData?: {
    merchant_id?: string;
    product_id?: string;
    discount_type?: "percentage" | "flat";
    discount_value?: string;
    is_active?: boolean;
  };
}

export const DiscountForm = ({ mode, discountId, initialData }: DiscountFormProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditMode = mode === "edit";

  // Fetch merchants for dropdown
  const { data: merchants, isLoading: merchantsLoading } = useQuery({
    queryKey: ["merchants-dropdown"],
    queryFn: () => getMerchantsForDropdown(),
    staleTime: 300000,
  });

  const form = useForm<CreateDiscountFormData | UpdateDiscountFormData>({
    resolver: zodResolver(isEditMode ? updateDiscountSchema : createDiscountSchema),
    defaultValues: {
      merchant_id: initialData?.merchant_id || "",
      product_id: initialData?.product_id || "",
      discount_type: initialData?.discount_type || "percentage",
      discount_value: initialData?.discount_value || "",
      is_active: initialData?.is_active ?? true,
    },
  });

  // Watch merchant_id to fetch products
  const selectedMerchantId = useWatch({
    control: form.control,
    name: "merchant_id",
  });

  // Fetch products when merchant is selected
  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ["products-for-merchant", selectedMerchantId],
    queryFn: () => getProductsForMerchant(selectedMerchantId || ""),
    enabled: !!selectedMerchantId,
    staleTime: 300000,
  });

  // Watch discount type to show appropriate description
  const discountType = useWatch({
    control: form.control,
    name: "discount_type",
  });

  const onSubmit = async (data: CreateDiscountFormData | UpdateDiscountFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      if (isEditMode && discountId) {
        const result = await updateDiscount(discountId, data as UpdateDiscountFormData);
        if (result.success && result.discount) {
          window.location.href = `/admin/discounts/${discountId}`;
        } else {
          setError(result.error || "Failed to update discount");
        }
      } else {
        const result = await createDiscount(data as CreateDiscountFormData);
        if (result.success && result.discount) {
          window.location.href = `/admin/discounts/${result.discount.id}`;
        } else {
          setError(result.error || "Failed to create discount");
        }
      }
    } catch (err: any) {
      setError(
        err.message ||
        `An error occurred while ${isEditMode ? "updating" : "creating"} the discount`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (isEditMode && discountId) {
      router.push(`/admin/discounts/${discountId}`);
    } else {
      router.push("/admin/discounts");
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
        {isEditMode ? "Back to Discount Details" : "Back to Discounts"}
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
                  Select Merchant
                </CardTitle>
                <CardDescription>
                  Choose the merchant for this discount
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
                        Select the merchant to apply the discount for
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {selectedMerchantId && merchants && (
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="text-sm font-medium">
                      {merchants.find((m) => m.id === selectedMerchantId)?.business_name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Code: {merchants.find((m) => m.id === selectedMerchantId)?.merchant_code}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Product Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Select Product
                </CardTitle>
                <CardDescription>
                  {selectedMerchantId 
                    ? "Choose the product to apply discount for" 
                    : "Please select a merchant first"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="product_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product *</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value}
                        disabled={!selectedMerchantId || productsLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={selectedMerchantId ? "Select a product" : "Select merchant first"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {!selectedMerchantId ? (
                            <SelectItem value="none" disabled>Please select a merchant first</SelectItem>
                          ) : productsLoading ? (
                            <SelectItem value="loading" disabled>Loading products...</SelectItem>
                          ) : products && products.length > 0 ? (
                            products.map((product) => (
                              <SelectItem key={product.id} value={product.id}>
                                {product.product_name} ({product.product_code})
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="none" disabled>No products available</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Select the product to apply discount for
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {form.watch("product_id") && products && (
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="text-sm font-medium">
                      {products.find((p) => p.id === form.watch("product_id"))?.product_name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Code: {products.find((p) => p.id === form.watch("product_id"))?.product_code}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Category: {products.find((p) => p.id === form.watch("product_id"))?.vas_product_categories.name}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Discount Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Discount Configuration</CardTitle>
              <CardDescription>
                Set the discount type and value
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="discount_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Discount Type *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select discount type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="percentage">Percentage (%)</SelectItem>
                          <SelectItem value="flat">Flat Amount (₦)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Choose how the discount is calculated
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="discount_value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Discount Value *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder={discountType === "percentage" ? "10" : "100.00"}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        {discountType === "percentage" 
                          ? "Enter percentage (0-100)" 
                          : "Enter flat amount in NGN"}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {discountType && form.watch("discount_value") && (
                <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <div className="text-sm font-medium mb-1">Preview</div>
                  <div className="text-2xl font-bold">
                    {discountType === "percentage" 
                      ? `${form.watch("discount_value")}%` 
                      : `₦${Number(form.watch("discount_value")).toLocaleString()}`}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {discountType === "percentage" 
                      ? "Percentage discount will be calculated from the product price" 
                      : "Fixed amount discount will be deducted from the product price"}
                  </div>
                </div>
              )}

              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Active Status</FormLabel>
                      <FormDescription>
                        Enable or disable this discount
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

          <div className="flex items-center justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || merchantsLoading || productsLoading || !selectedMerchantId}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditMode ? "Updating..." : "Creating..."}
                </>
              ) : (
                isEditMode ? "Update Discount" : "Create Discount"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

