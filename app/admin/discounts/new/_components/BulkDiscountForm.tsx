"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2, Building2, Package } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getMerchantsForDropdown } from "../../_actions/getMerchantsForDropdown";
import { getProductsForMerchant } from "../../_actions/getProductsForMerchant";
import { getDiscountsByMerchant } from "../../_actions/getDiscountsByMerchant";
import { bulkUpdateDiscounts } from "../../_actions/bulkUpdateDiscounts";
import { TableOverlayLoader } from "@/components/ui/table-overlay-loader";

interface ProductDiscount {
  product_id: string;
  product_name: string;
  product_code: string;
  category: string;
  discount_type: "percentage" | "flat" | "";
  discount_value: string;
  is_active: boolean;
  discount_id?: string;
  hasDiscount: boolean;
}

export const BulkDiscountForm = () => {
  const router = useRouter();
  const [selectedMerchantId, setSelectedMerchantId] = useState<string>("");
  const [productDiscounts, setProductDiscounts] = useState<ProductDiscount[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch merchants
  const { data: merchants, isLoading: merchantsLoading } = useQuery({
    queryKey: ["merchants-dropdown"],
    queryFn: () => getMerchantsForDropdown(),
    staleTime: 300000,
  });

  // Fetch products when merchant is selected
  const { data: products, isLoading: productsLoading, error: productsError } = useQuery({
    queryKey: ["products-for-merchant", selectedMerchantId],
    queryFn: () => getProductsForMerchant(selectedMerchantId),
    enabled: !!selectedMerchantId,
    staleTime: 300000,
  });

  // Debug logging
  useEffect(() => {
    if (selectedMerchantId) {
      console.log("Merchant selected:", selectedMerchantId);
      console.log("Products loading:", productsLoading);
      console.log("Products data:", products);
      console.log("Products error:", productsError);
    }
  }, [selectedMerchantId, productsLoading, products, productsError]);

  // Fetch existing discounts when merchant is selected
  const { data: existingDiscounts } = useQuery({
    queryKey: ["discounts-by-merchant", selectedMerchantId],
    queryFn: () => getDiscountsByMerchant(selectedMerchantId),
    enabled: !!selectedMerchantId,
    staleTime: 30000,
  });

  // Initialize product discounts when products or existing discounts change
  useEffect(() => {
    if (products !== undefined) {
      if (products.length > 0) {
        const discounts = products.map((product) => {
          const existingDiscount = existingDiscounts?.[product.id];
          return {
            product_id: product.id,
            product_name: product.product_name,
            product_code: product.product_code,
            category: product.vas_product_categories.name,
            discount_type: existingDiscount?.discount_type || "",
            discount_value: existingDiscount?.discount_value || "",
            is_active: existingDiscount?.is_active ?? true,
            discount_id: existingDiscount?.id,
            hasDiscount: !!existingDiscount,
          };
        });
        setProductDiscounts(discounts);
      } else {
        // Reset if no products
        setProductDiscounts([]);
      }
    }
  }, [products, existingDiscounts]);

  const handleMerchantChange = (merchantId: string) => {
    setSelectedMerchantId(merchantId);
    setProductDiscounts([]);
    setError(null);
    setSuccess(null);
  };

  const handleDiscountChange = (
    productId: string,
    field: "discount_type" | "discount_value" | "is_active",
    value: string | boolean
  ) => {
    setProductDiscounts((prev) =>
      prev.map((item) =>
        item.product_id === productId
          ? { 
              ...item, 
              [field]: value === "none" ? "" : value,
              // Clear discount_value when type is cleared
              ...(field === "discount_type" && value === "none" ? { discount_value: "" } : {})
            }
          : item
      )
    );
  };

  const handleRemoveDiscount = (productId: string) => {
    setProductDiscounts((prev) =>
      prev.map((item) =>
        item.product_id === productId
          ? {
              ...item,
              discount_type: "",
              discount_value: "",
              hasDiscount: false,
            }
          : item
      )
    );
  };

  const handleSave = async () => {
    if (!selectedMerchantId) {
      setError("Please select a merchant first");
      return;
    }

    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const updates: any[] = [];

      productDiscounts.forEach((item) => {
        if (item.hasDiscount && item.discount_id) {
          // Existing discount
          if (!item.discount_type || !item.discount_value) {
            // Remove discount (cleared)
            updates.push({
              product_id: item.product_id,
              action: "delete",
              discount_id: item.discount_id,
            });
          } else {
            // Update existing discount
            updates.push({
              product_id: item.product_id,
              discount_type: item.discount_type as "percentage" | "flat",
              discount_value: item.discount_value,
              is_active: item.is_active,
              action: "update",
              discount_id: item.discount_id,
            });
          }
        } else if (item.discount_type && item.discount_value) {
          // Create new discount
          updates.push({
            product_id: item.product_id,
            discount_type: item.discount_type as "percentage" | "flat",
            discount_value: item.discount_value,
            is_active: item.is_active,
            action: "create",
          });
        }
      });

      if (updates.length === 0) {
        setError("No changes to save");
        setIsSaving(false);
        return;
      }

      const result = await bulkUpdateDiscounts(selectedMerchantId, updates);

      if (result.success) {
        const message = `Successfully saved: ${result.results.created} created, ${result.results.updated} updated, ${result.results.deleted} deleted`;
        if (result.results.errors.length > 0) {
          setError(`${message}. Errors: ${result.results.errors.slice(0, 3).join("; ")}`);
        } else {
          setSuccess(message);
        }
        // Refresh discounts
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        setError(result.error || "Failed to save discounts");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while saving discounts");
    } finally {
      setIsSaving(false);
    }
  };

  const selectedMerchant = merchants?.find((m) => m.id === selectedMerchantId);

  // Calculate summary of changes
  const changesSummary = {
    new: productDiscounts.filter(
      (item) => !item.hasDiscount && item.discount_type && item.discount_value
    ).length,
    updated: productDiscounts.filter(
      (item) => item.hasDiscount && item.discount_id && item.discount_type && item.discount_value
    ).length,
    removed: productDiscounts.filter(
      (item) => item.hasDiscount && item.discount_id && (!item.discount_type || !item.discount_value)
    ).length,
  };

  const hasChanges = changesSummary.new > 0 || changesSummary.updated > 0 || changesSummary.removed > 0;

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        onClick={() => router.push("/admin/discounts")}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Discounts
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Bulk Discount Management</CardTitle>
          <CardDescription>
            Select a merchant and manage discounts for all products at once
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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

          {/* Merchant Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Merchant *</label>
            <Select
              value={selectedMerchantId}
              onValueChange={handleMerchantChange}
              disabled={merchantsLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a merchant" />
              </SelectTrigger>
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
          </div>

          {/* Products Table */}
          {selectedMerchantId && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Products & Discounts</h3>
                  {hasChanges && (
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span className="text-green-600 dark:text-green-400">
                        {changesSummary.new} new
                      </span>
                      <span className="text-blue-600 dark:text-blue-400">
                        {changesSummary.updated} updated
                      </span>
                      {changesSummary.removed > 0 && (
                        <span className="text-red-600 dark:text-red-400">
                          {changesSummary.removed} removed
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <Button
                  onClick={handleSave}
                  disabled={isSaving || productsLoading || productDiscounts.length === 0 || !hasChanges}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save All Changes
                    </>
                  )}
                </Button>
              </div>

              <div className="relative rounded-md border">
                <TableOverlayLoader isVisible={productsLoading} />
                <div className="max-h-[600px] overflow-auto">
                  <Table>
                    <TableHeader className="sticky top-0 bg-background z-10">
                      <TableRow>
                        <TableHead className="min-w-[200px]">Product</TableHead>
                        <TableHead className="min-w-[120px]">Category</TableHead>
                        <TableHead className="min-w-[150px]">Discount Type</TableHead>
                        <TableHead className="min-w-[150px]">Discount Value</TableHead>
                        <TableHead className="min-w-[100px]">Active</TableHead>
                        <TableHead className="min-w-[100px]">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {productsLoading ? (
                        Array.from({ length: 5 }).map((_, i) => (
                          <TableRow key={i}>
                            <TableCell><Skeleton className="h-4 w-[180px]" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-[130px]" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-[130px]" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                          </TableRow>
                        ))
                      ) : productsError ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-destructive">
                            Error loading products: {productsError instanceof Error ? productsError.message : "Unknown error"}
                          </TableCell>
                        </TableRow>
                      ) : !products || products.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                            No products available for this merchant.
                          </TableCell>
                        </TableRow>
                      ) : (
                        productDiscounts.map((item) => (
                          <TableRow
                            key={item.product_id}
                            className={item.hasDiscount ? "bg-muted/30" : ""}
                          >
                            <TableCell>
                              <div>
                                <div className="font-medium">{item.product_name}</div>
                                <div className="text-xs text-muted-foreground font-mono">
                                  {item.product_code}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs">
                                {item.category}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Select
                                value={item.discount_type || "none"}
                                onValueChange={(value) =>
                                  handleDiscountChange(
                                    item.product_id,
                                    "discount_type",
                                    value
                                  )
                                }
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="none">None</SelectItem>
                                  <SelectItem value="percentage">Percentage (%)</SelectItem>
                                  <SelectItem value="flat">Flat Amount (₦)</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  max={item.discount_type === "percentage" ? "100" : undefined}
                                  placeholder={item.discount_type === "percentage" ? "10" : "100.00"}
                                  value={item.discount_value}
                                  onChange={(e) =>
                                    handleDiscountChange(
                                      item.product_id,
                                      "discount_value",
                                      e.target.value
                                    )
                                  }
                                  disabled={!item.discount_type}
                                  className="w-full"
                                />
                                {item.discount_type && item.discount_value && (
                                  <div className="text-xs font-medium text-primary">
                                    {item.discount_type === "percentage"
                                      ? `${item.discount_value}% discount`
                                      : `₦${Number(item.discount_value).toLocaleString()} discount`}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Switch
                                checked={item.is_active}
                                onCheckedChange={(checked) =>
                                  handleDiscountChange(
                                    item.product_id,
                                    "is_active",
                                    checked
                                  )
                                }
                                disabled={!item.discount_type || !item.discount_value}
                              />
                            </TableCell>
                            <TableCell>
                              {item.hasDiscount ? (
                                <Badge variant="secondary" className="text-xs">
                                  Has Discount
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-xs">
                                  No Discount
                                </Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

