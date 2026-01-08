"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft, Percent } from "lucide-react";

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
  updateDiscountSchema,
  type UpdateDiscountFormData,
} from "@/lib/validations/discount";
import { updateDiscount } from "../../../_actions/updateDiscount";

// Re-using the interface defined in DiscountDetails.tsx
interface DiscountDetailsItem {
  id: string; // Serialized BigInt
  discount_type: string;
  discount_value: string; // Serialized Decimal
  is_active: boolean;
  created_at: string | Date | null;
  updated_at: string | Date | null;
  merchant_id: string; // Serialized BigInt
  product_id: string; // Serialized BigInt

  vas_merchants: {
    id: string; // Serialized BigInt
    merchant_code: string;
    business_name: string;
  };
  vas_products: {
    id: string; // Serialized BigInt
    product_name: string;
    product_code: string;
    vas_product_categories: {
      name: string;
      category_code: string;
    };
  };
  // Add other properties from vas_merchant_discount model if used in the component
}

interface EditDiscountFormProps {
  discount: DiscountDetailsItem;
}

export const EditDiscountForm = ({ discount }: EditDiscountFormProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<UpdateDiscountFormData>({
    resolver: zodResolver(updateDiscountSchema),
    defaultValues: {
      merchant_id: discount.merchant_id,
      product_id: discount.product_id,
      discount_type: discount.discount_type as "percentage" | "flat",
      discount_value: discount.discount_value,
      is_active: discount.is_active,
    },
  });

  const discountType = form.watch("discount_type");

  const onSubmit = async (data: UpdateDiscountFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await updateDiscount(discount.id, data);
      if (result.success && result.discount) {
        window.location.href = `/admin/discounts/${discount.id}`;
      } else {
        setError(result.error || "Failed to update discount");
      }
    } catch (err: unknown) {
      setError(
        (err instanceof Error ? err.message : String(err)) || "An error occurred while updating the discount"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push(`/admin/discounts/${discount.id}`);
  };

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        onClick={handleCancel}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Discount Details
      </Button>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <Alert variant="destructive" role="alert" aria-live="polite">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            {/* Merchant & Product Info (Read-only) */}
            <Card>
              <CardHeader>
                <CardTitle>Merchant & Product</CardTitle>
                <CardDescription>
                  Merchant and product information (cannot be changed)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Merchant</label>
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="font-medium">{discount.vas_merchants.business_name}</div>
                    <div className="text-xs text-muted-foreground">
                      Code: {discount.vas_merchants.merchant_code}
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Product</label>
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="font-medium">{discount.vas_products.product_name}</div>
                    <div className="text-xs text-muted-foreground">
                      Code: {discount.vas_products.product_code}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Discount Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Percent className="h-5 w-5" />
                  Discount Configuration
                </CardTitle>
                <CardDescription>
                  Update the discount type and value
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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
                          min="0"
                          max={discountType === "percentage" ? "100" : undefined}
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
                  Updating...
                </>
              ) : (
                "Update Discount"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
