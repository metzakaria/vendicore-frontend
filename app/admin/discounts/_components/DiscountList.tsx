"use client";

import { useState, useEffect } from "react";
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
import { Settings2, Loader2 } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { getDiscounts } from "../_actions/getDiscounts";
import { getMerchantsForDropdown } from "../_actions/getMerchantsForDropdown";
import { getProductsForDropdown } from "../_actions/getProductsForDropdown";
import { getProductsForMerchant } from "../_actions/getProductsForMerchant";
import { getDiscountsByMerchant } from "../_actions/getDiscountsByMerchant";
import { bulkUpdateDiscounts } from "../_actions/bulkUpdateDiscounts";
import { TableOverlayLoader } from "@/components/ui/table-overlay-loader";

interface Discount {
  id: string;
  discount_type: string;
  discount_value: string;
  is_active: boolean;
  created_at: Date | null;
  updated_at: Date | null;
  updated_by: string | null;
  vas_merchants: {
    id: string;
    merchant_code: string;
    business_name: string;
  };
  vas_products: {
    id: string;
    product_name: string;
    product_code: string;
  };
  vas_users_vas_merchant_discount_updated_byTovas_users: {
    id: string;
    username: string;
    email: string;
  } | null;
}

interface DiscountsResponse {
  discounts: Discount[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
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
  page: number,
  status: string,
  merchantId: string,
  productId: string
): Promise<DiscountsResponse> => {
  const result = await getDiscounts({
    page,
    limit: 10,
    status: status as "active" | "inactive" | "all",
    merchant_id: merchantId && merchantId !== "all" ? merchantId : undefined,
    product_id: productId && productId !== "all" ? productId : undefined,
  });

  return {
    discounts: result.discounts as Discount[],
    total: result.total,
    page: result.page,
    limit: result.limit,
    totalPages: result.totalPages,
  };
};

export const DiscountList = () => {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState("all");
  const [merchantId, setMerchantId] = useState("all");
  const [productId, setProductId] = useState("all");
  const [page, setPage] = useState(1);
  
  // Manage modal state
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [selectedMerchantId, setSelectedMerchantId] = useState("");
  const [productDiscounts, setProductDiscounts] = useState<ProductDiscount[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  // Fetch merchants for dropdown
  const { data: merchants } = useQuery({
    queryKey: ["merchants-dropdown"],
    queryFn: () => getMerchantsForDropdown(),
    staleTime: 300000, // 5 minutes
  });

  // Fetch products for dropdown
  const { data: products } = useQuery({
    queryKey: ["products-dropdown"],
    queryFn: () => getProductsForDropdown(),
    staleTime: 300000, // 5 minutes
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setStatus(params.get("status") || "all");
    setMerchantId(params.get("merchant_id") || "all");
    setProductId(params.get("product_id") || "all");
    setPage(Number(params.get("page")) || 1);
  }, []);

  // Update URL when filters change (without page reload)
  useEffect(() => {
    // Skip initial render to prevent flicker
    if (status === "all" && merchantId === "all" && productId === "all" && page === 1) {
      return;
    }

    const params = new URLSearchParams();
    if (status !== "all") params.set("status", status);
    if (merchantId !== "all") params.set("merchant_id", merchantId);
    if (productId !== "all") params.set("product_id", productId);
    if (page > 1) params.set("page", page.toString());

    const newUrl = `/admin/discounts${params.toString() ? `?${params.toString()}` : ""}`;
    // Use replaceState to update URL without triggering navigation
    if (window.location.pathname + window.location.search !== newUrl) {
      window.history.replaceState({}, "", newUrl);
    }
  }, [status, merchantId, productId, page]);

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ["discounts", page, status, merchantId, productId],
    queryFn: () => fetchDiscounts(page, status, merchantId, productId),
    retry: 1,
    keepPreviousData: true,
    staleTime: 30000,
  });

  const handleStatusChange = (value: string) => {
    setStatus(value);
    setPage(1);
  };

  const handleMerchantChange = (value: string) => {
    setMerchantId(value);
    setPage(1);
  };

  const handleProductChange = (value: string) => {
    setProductId(value);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const formatDiscount = (type: string, value: string) => {
    if (type === "percentage") {
      return `${value}%`;
    }
    return `₦${Number(value).toLocaleString()}`;
  };

  const formatDateTime = (date: Date | string | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-NG", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Fetch products for selected merchant in modal
  const { data: modalProducts, isLoading: isLoadingModalProducts } = useQuery({
    queryKey: ["products-for-merchant", selectedMerchantId],
    queryFn: () => getProductsForMerchant(selectedMerchantId),
    enabled: !!selectedMerchantId && isManageModalOpen,
    staleTime: 60000,
  });

  // Fetch existing discounts for selected merchant in modal
  const { data: modalDiscounts, isLoading: isLoadingModalDiscounts } = useQuery({
    queryKey: ["discounts-by-merchant", selectedMerchantId],
    queryFn: () => getDiscountsByMerchant(selectedMerchantId),
    enabled: !!selectedMerchantId && isManageModalOpen,
    staleTime: 60000,
  });

  // Update productDiscounts when products and discounts are loaded
  useEffect(() => {
    if (modalProducts && modalDiscounts && selectedMerchantId) {
      // modalDiscounts is an object map: { product_id: { id, discount_type, discount_value, is_active } }
      const discountMap = modalDiscounts as Record<string, any>;

      const combined: ProductDiscount[] = modalProducts.map((product: any) => {
        const existingDiscount = discountMap[product.id];
        return {
          product_id: product.id,
          product_name: product.product_name,
          product_code: product.product_code,
          category: product.vas_product_categories?.name || "",
          discount_type: existingDiscount?.discount_type || "",
          discount_value: existingDiscount?.discount_value?.toString() || "",
          is_active: existingDiscount?.is_active ?? true,
          discount_id: existingDiscount?.id,
          hasDiscount: !!existingDiscount,
        };
      });

      setProductDiscounts(combined);
    }
  }, [modalProducts, modalDiscounts, selectedMerchantId]);

  const handleOpenManageModal = () => {
    setSelectedMerchantId("");
    setProductDiscounts([]);
    setSaveError(null);
    setSaveSuccess(null);
    setIsManageModalOpen(true);
  };

  const handleSelectMerchantForModal = (value: string) => {
    setSelectedMerchantId(value);
    setProductDiscounts([]);
    setSaveError(null);
    setSaveSuccess(null);
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
              [field]: value === "_none" ? "" : value,
              ...(field === "discount_type" && value === "_none" ? { discount_value: "" } : {}),
            }
          : item
      )
    );
  };

  const handleSaveDiscounts = async () => {
    if (!selectedMerchantId) return;
    
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(null);

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
        setSaveError("No changes to save");
        setIsSaving(false);
        return;
      }

      const result = await bulkUpdateDiscounts(selectedMerchantId, updates);

      if (result.success && result.results) {
        const message = `Saved: ${result.results.created} created, ${result.results.updated} updated, ${result.results.deleted} deleted`;
        if (result.results.errors.length > 0) {
          setSaveError(`${message}. Errors: ${result.results.errors.slice(0, 3).join("; ")}`);
        } else {
          setSaveSuccess(message);
        }
        queryClient.invalidateQueries({ queryKey: ["discounts"] });
        queryClient.invalidateQueries({ queryKey: ["discounts-by-merchant"] });
        setTimeout(() => {
          setIsManageModalOpen(false);
          setSaveSuccess(null);
        }, 1500);
      } else {
        setSaveError(result.error || "Failed to save discounts");
      }
    } catch (err: any) {
      setSaveError(err.message || "An error occurred while saving discounts");
    } finally {
      setIsSaving(false);
    }
  };

  const discounts = data?.discounts || [];
  const totalPages = data?.totalPages || 1;
  const currentPage = data?.page || page;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Discounts</h2>
          <p className="text-muted-foreground">
            Manage merchant discounts for products
          </p>
        </div>
        <Button onClick={handleOpenManageModal}>
          <Settings2 className="mr-2 h-4 w-4" />
          Manage Discounts
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <Select value={productId} onValueChange={handleProductChange}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Product" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Products</SelectItem>
            {products?.map((product) => (
              <SelectItem key={product.id} value={product.id}>
                {product.product_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
        <Select value={merchantId} onValueChange={handleMerchantChange}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Merchant" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Merchants</SelectItem>
            {merchants?.map((merchant) => (
              <SelectItem key={merchant.id} value={merchant.id}>
                {merchant.business_name} ({merchant.merchant_code})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Progress bar for background fetching */}
      {isFetching && !isLoading && (
        <div className="h-1 w-full overflow-hidden rounded-full bg-secondary">
          <div className="h-full w-full animate-pulse bg-primary/20" />
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border relative">
        <TableOverlayLoader isVisible={isFetching} />
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Merchant</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Discount Type</TableHead>
              <TableHead>Discount Value</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {error ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-destructive">
                  Error loading discounts. Please try again.
                </TableCell>
              </TableRow>
            ) : discounts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No discounts found.
                </TableCell>
              </TableRow>
            ) : (
              discounts.map((discount) => (
                <TableRow key={discount.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{discount.vas_merchants.business_name}</div>
                      <div className="text-xs text-muted-foreground">
                        {discount.vas_merchants.merchant_code}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{discount.vas_products.product_name}</div>
                      <div className="text-xs text-muted-foreground">
                        {discount.vas_products.product_code}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {discount.discount_type}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatDiscount(discount.discount_type, discount.discount_value)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={discount.is_active ? "default" : "secondary"}>
                      {discount.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="text-sm font-medium">
                        {discount.vas_users_vas_merchant_discount_updated_byTovas_users?.username || "N/A"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatDateTime(discount.updated_at)}
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
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

      {/* Manage Discounts Modal */}
      <Dialog open={isManageModalOpen} onOpenChange={setIsManageModalOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Manage Discounts</DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto space-y-4 py-4">
            {/* Merchant Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Please Select Merchant To Manger Their Discount</label>
              <Select value={selectedMerchantId} onValueChange={handleSelectMerchantForModal}>
                <SelectTrigger className="w-full sm:w-[300px] border-2 text-md">
                  <SelectValue placeholder="Select a merchant" />
                </SelectTrigger>
                <SelectContent>
                  {merchants?.map((merchant) => (
                    <SelectItem key={merchant.id} value={merchant.id}>
                      {merchant.business_name} ({merchant.merchant_code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedMerchantId && (
              <>
                {isLoadingModalProducts || isLoadingModalDiscounts ? (
                  <div className="space-y-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full border-2" />
                    ))}
                  </div>
                ) : productDiscounts.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    No products available.
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[250px]">Product</TableHead>
                          <TableHead className="w-[150px]">Discount Type</TableHead>
                          <TableHead className="w-[150px]">Value</TableHead>
                          <TableHead className="w-[100px]">Active</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {productDiscounts.map((item) => (
                          <TableRow key={item.product_id}>
                            <TableCell>
                              <div>
                                <div className="font-medium text-sm">{item.product_name}</div>
                                <div className="text-xs text-muted-foreground">{item.product_code}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Select
                                value={item.discount_type || "_none"}
                                onValueChange={(value) =>
                                  handleDiscountChange(item.product_id, "discount_type", value)
                                }
                              >
                                <SelectTrigger className="w-[130px] h-8">
                                  <SelectValue placeholder="Type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="_none">None</SelectItem>
                                  <SelectItem value="percentage">Percentage</SelectItem>
                                  <SelectItem value="flat">Flat</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              <div className="relative flex items-center">
                                {item.discount_type && (
                                  <span className="absolute left-2 text-muted-foreground text-sm pointer-events-none">
                                    {item.discount_type === "percentage" ? "%" : "₦"}
                                  </span>
                                )}
                                <Input
                                  type="number"
                                  value={item.discount_value}
                                  onChange={(e) =>
                                    handleDiscountChange(item.product_id, "discount_value", e.target.value)
                                  }
                                  disabled={!item.discount_type}
                                  className={`w-[100px] h-8 ${item.discount_type ? "pl-6" : ""}`}
                                  min="0"
                                  max={item.discount_type === "percentage" ? "100" : undefined}
                                />
                              </div>
                            </TableCell>
                            <TableCell>
                              <Checkbox
                                checked={item.is_active}
                                onCheckedChange={(checked) =>
                                  handleDiscountChange(item.product_id, "is_active", !!checked)
                                }
                                disabled={!item.discount_type}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </>
            )}

            {saveError && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                {saveError}
              </div>
            )}

            {saveSuccess && (
              <div className="text-sm text-green-600 bg-green-50 p-3 rounded-md">
                {saveSuccess}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 pt-4 border-t flex-shrink-0">
            <Button
              variant="outline"
              onClick={() => setIsManageModalOpen(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveDiscounts}
              disabled={isSaving || !selectedMerchantId}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

