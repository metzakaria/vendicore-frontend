"use client";

import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { Plus } from "lucide-react";
import { getDiscounts } from "@/app/admin/discounts/_actions/getDiscounts";
import { getProductsForMerchant } from "@/app/admin/discounts/_actions/getProductsForMerchant";
import { getDiscountsByMerchant } from "@/app/admin/discounts/_actions/getDiscountsByMerchant";
import { bulkUpdateDiscounts } from "@/app/admin/discounts/_actions/bulkUpdateDiscounts";

interface MerchantDiscountsProps {
  merchantId: string;
}

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

const fetchDiscounts = async (
  merchantId: string,
  page: number,
  productId: string,
  discountType: string
) => {
  const params: any = {
    page,
    limit: 10,
    merchant_id: merchantId,
  };

  // Only add discount_type if it's not "all"
  if (discountType && discountType !== "all") {
    params.discount_type = discountType as "percentage" | "flat";
  }

  // Only add product_id if it's not "all"
  if (productId && productId !== "all") {
    params.product_id = productId;
  }

  console.log("fetchDiscounts params:", params);

  const result = await getDiscounts(params);

  console.log("fetchDiscounts result:", {
    discountsCount: result.discounts?.length || 0,
    total: result.total,
  });

  return {
    discounts: result.discounts || [],
    total: result.total || 0,
    page: result.page || page,
    limit: result.limit || 10,
    totalPages: result.totalPages || 0,
  };
};

export const MerchantDiscounts = ({ merchantId }: MerchantDiscountsProps) => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [productId, setProductId] = useState("all");
  const [discountType, setDiscountType] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productDiscounts, setProductDiscounts] = useState<ProductDiscount[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setPage(Number(params.get("discountPage")) || 1);
    setProductId(params.get("discountProduct") || "all");
    setDiscountType(params.get("discountType") || "all");
  }, []);

  // Fetch products for filter
  const { data: products } = useQuery({
    queryKey: ["products-for-merchant", merchantId],
    queryFn: () => getProductsForMerchant(),
    enabled: !!merchantId,
    staleTime: 300000,
  });

  // Fetch existing discounts for modal
  const { data: existingDiscounts } = useQuery({
    queryKey: ["discounts-by-merchant", merchantId],
    queryFn: () => getDiscountsByMerchant(merchantId),
    enabled: !!merchantId && isModalOpen,
    staleTime: 30000,
  });

  // Initialize product discounts when modal opens
  useEffect(() => {
    if (isModalOpen && products && existingDiscounts !== undefined) {
      const discounts = products.map((product: any) => {
        const existingDiscount = existingDiscounts?.[product.id];
        return {
          product_id: product.id,
          product_name: product.product_name,
          product_code: product.product_code,
          category: product.vas_product_categories?.name || "N/A",
          discount_type: existingDiscount?.discount_type || "",
          discount_value: existingDiscount?.discount_value?.toString() || "",
          is_active: existingDiscount?.is_active ?? true,
          discount_id: existingDiscount?.id,
          hasDiscount: !!existingDiscount,
        };
      });
      setProductDiscounts(discounts);
    }
  }, [isModalOpen, products, existingDiscounts]);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (productId !== "all") params.set("discountProduct", productId);
    else params.delete("discountProduct");
    if (discountType !== "all") params.set("discountType", discountType);
    else params.delete("discountType");
    if (page > 1) params.set("discountPage", page.toString());
    else params.delete("discountPage");

    window.history.replaceState(
      {},
      "",
      `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ""}`
    );
  }, [productId, discountType, page]);

  const { data, isLoading, isFetching, error: queryError } = useQuery({
    queryKey: ["merchant-discounts", merchantId, page, productId, discountType],
    queryFn: () => fetchDiscounts(merchantId, page, productId, discountType),
    enabled: !!merchantId,
    retry: 1,
    staleTime: 30000,
  });

  // Debug log
  useEffect(() => {
    console.log("MerchantDiscounts query state:", {
      merchantId,
      productId,
      discountType,
      isLoading,
      isFetching,
      hasData: !!data,
      discountsCount: data?.discounts?.length || 0,
      error: queryError,
    });
  }, [merchantId, productId, discountType, isLoading, isFetching, data, queryError]);

  const formatDiscount = (type: string, value: string) => {
    if (type === "percentage") {
      return `${value}%`;
    }
    return `₦${new Intl.NumberFormat("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(value))}`;
  };

  const formatDateTime = (date: Date | string | null) => {
    if (!date) return "N/A";
    return format(new Date(date), "MMM dd, yyyy HH:mm");
  };

  const handleProductChange = (value: string) => {
    setProductId(value);
    setPage(1);
  };

  const handleDiscountTypeChange = (value: string) => {
    setDiscountType(value);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
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
              ...(field === "discount_type" && value === "none" ? { discount_value: "" } : {}),
            }
          : item
      )
    );
  };

  const handleSave = async () => {
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

      const result = await bulkUpdateDiscounts(merchantId, updates);

              if (result.success && result.results) {
                const message = `Successfully saved: ${result.results.created} created, ${result.results.updated} updated, ${result.results.deleted} deleted`;
                if (result.results.errors.length > 0) {
                  setError(`${message}. Errors: ${result.results.errors.slice(0, 3).join("; ")}`);
                } else {
                  setSuccess(message);
                }
        queryClient.invalidateQueries({ queryKey: ["merchant-discounts"] });
        queryClient.invalidateQueries({ queryKey: ["discounts-by-merchant"] });
        setTimeout(() => {
          setIsModalOpen(false);
          setSuccess(null);
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

  const discounts = data?.discounts || [];
  const totalPages = data?.totalPages || 1;
  const currentPage = data?.page || page;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Discounts</CardTitle>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Manage Discounts
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex items-center gap-4">
            <Select value={productId} onValueChange={handleProductChange}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by product" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Products</SelectItem>
                {products?.map((product: any) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.product_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={discountType} onValueChange={handleDiscountTypeChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by discount type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="percentage">Percentage</SelectItem>
                <SelectItem value="flat">Flat</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {isLoading && !data ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : queryError ? (
            <div className="text-center text-destructive py-8">
              <p>Error loading discounts. Please try again.</p>
              <p className="text-xs mt-2">
                {queryError instanceof Error ? queryError.message : String(queryError)}
              </p>
            </div>
          ) : discounts.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No discounts found.
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Discount Type</TableHead>
                      <TableHead>Discount Value</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {discounts.map((discount: any) => (
                      <TableRow key={discount.id}>
                        <TableCell>
                          <div className="text-sm font-medium">{discount.vas_products?.product_name || "N/A"}</div>
                          <div className="text-xs text-muted-foreground">{discount.vas_products?.product_code || ""}</div>
                        </TableCell>
                        <TableCell className="text-sm capitalize">{discount.discount_type}</TableCell>
                        <TableCell className="text-sm font-medium">
                          {formatDiscount(discount.discount_type, discount.discount_value)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={discount.is_active ? "default" : "secondary"}>
                            {discount.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{formatDateTime(discount.created_at)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Showing page {currentPage} of {totalPages} ({data?.total || 0} total discounts)
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1 || isFetching}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage >= totalPages || isFetching}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </CardContent>

        {/* Manage Discounts Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Discounts</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                {error}
              </div>
            )}
            {success && (
              <div className="p-3 text-sm text-green-700 bg-green-50 rounded-md">
                {success}
              </div>
            )}

            {productDiscounts.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4 mx-auto" />
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {productDiscounts.map((item) => (
                    <TableRow key={item.product_id}>
                      <TableCell>
                        <div className="text-sm font-medium">{item.product_name}</div>
                        <div className="text-xs text-muted-foreground">{item.product_code}</div>
                      </TableCell>
                      <TableCell className="text-sm">{item.category}</TableCell>
                      <TableCell>
                        <Select
                          value={item.discount_type || "none"}
                          onValueChange={(value) =>
                            handleDiscountChange(item.product_id, "discount_type", value)
                          }
                        >
                          <SelectTrigger className="w-[120px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            <SelectItem value="percentage">Percentage</SelectItem>
                            <SelectItem value="flat">Flat</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        {item.discount_type ? (
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            max={item.discount_type === "percentage" ? "100" : undefined}
                            placeholder={item.discount_type === "percentage" ? "0-100" : "0.00"}
                            value={item.discount_value}
                            onChange={(e) =>
                              handleDiscountChange(item.product_id, "discount_value", e.target.value)
                            }
                            className="w-[120px]"
                          />
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {item.discount_type ? (
                          <div className="flex items-center gap-2">
                            <Checkbox
                              checked={item.is_active}
                              onCheckedChange={(checked) =>
                                handleDiscountChange(item.product_id, "is_active", checked === true)
                              }
                            />
                            <span className="text-xs text-muted-foreground">
                              {item.is_active ? "Active" : "Inactive"}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

