"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Filter } from "lucide-react";
import { format } from "date-fns";
import { getMerchantDiscounts } from "../_actions/getMerchantDiscounts";
import { getProductsForDropdown } from "../_actions/getProductsForDropdown";

const fetchDiscounts = async (
  page: number,
  productId: string,
  discountType: string
) => {
  const result = await getMerchantDiscounts({
    page,
    limit: 20,
    productId: productId !== "all" ? productId : undefined,
    discountType: discountType !== "all" ? (discountType as "percentage" | "fixed") : undefined,
  });

  return {
    discounts: result.discounts || [],
    total: result.total || 0,
    page: result.page || page,
    limit: result.limit || 20,
    totalPages: result.totalPages || 0,
  };
};

export const MerchantDiscountList = () => {
  const [productId, setProductId] = useState("all");
  const [discountType, setDiscountType] = useState("all");
  const [page, setPage] = useState(1);
  
  // Active filter values (applied when button is clicked)
  const [activeProductId, setActiveProductId] = useState("all");
  const [activeDiscountType, setActiveDiscountType] = useState("all");

  // Fetch products for dropdown
  const { data: products } = useQuery({
    queryKey: ["merchant-discount-products-dropdown"],
    queryFn: () => getProductsForDropdown(),
    staleTime: 300000,
  });

  // Initialize from URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    
    const initialProductId = params.get("product") || "all";
    setProductId(initialProductId);
    setActiveProductId(initialProductId);
    
    const initialDiscountType = params.get("discountType") || "all";
    setDiscountType(initialDiscountType);
    setActiveDiscountType(initialDiscountType);
    
    setPage(Number(params.get("page")) || 1);
  }, []);

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: [
      "merchant-discounts",
      page,
      activeProductId,
      activeDiscountType,
    ],
    queryFn: () =>
      fetchDiscounts(
        page,
        activeProductId,
        activeDiscountType
      ),
    retry: 1,
    staleTime: 30000,
  });

  const formatDiscount = (type: string, value: string) => {
    if (type === "percentage") {
      return `${value}%`;
    }
    return `₦${new Intl.NumberFormat("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(value))}`;
  };

  const formatDateTime = (date: string | Date | null) => {
    if (!date) return "N/A";
    return format(new Date(date), "MMM dd, yyyy HH:mm");
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const discounts = data?.discounts || [];
  const totalPages = data?.totalPages || 1;
  const currentPage = data?.page || page;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Discounts</h2>
        <p className="text-muted-foreground">
          View and manage your product discounts
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <Select value={productId} onValueChange={setProductId} disabled={!products}>
              <SelectTrigger>
                <SelectValue placeholder={products ? "Product" : "Loading products..."} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Products</SelectItem>
                {products && products.length > 0 ? (
                  products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.product_name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-products" disabled>
                    No products available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            <Select value={discountType} onValueChange={setDiscountType}>
              <SelectTrigger>
                <SelectValue placeholder="Discount Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="percentage">Percentage</SelectItem>
                <SelectItem value="fixed">Fixed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="mt-4 flex justify-end">
            <Button onClick={() => {
              // Apply filters when button is clicked
              setActiveProductId(productId);
              setActiveDiscountType(discountType);
              setPage(1);
              
              // Update URL
              const params = new URLSearchParams();
              if (productId !== "all") params.set("product", productId);
              if (discountType !== "all") params.set("discountType", discountType);

              const newUrl = `/discounts${params.toString() ? `?${params.toString()}` : ""}`;
              window.history.replaceState({}, "", newUrl);
            }}>
              <Filter className="mr-2 h-4 w-4" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Progress bar for background fetching */}
      {isFetching && !isLoading && (
        <div className="h-1 w-full overflow-hidden rounded-full bg-secondary">
          <div className="h-full w-full animate-pulse bg-primary/20" />
        </div>
      )}

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Discount List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Product</TableHead>
                    <TableHead className="w-[120px]">Discount Type</TableHead>
                    <TableHead className="w-[120px]">Discount Value</TableHead>
                    <TableHead className="w-[100px]">Status</TableHead>
                    <TableHead className="w-[140px]">Created At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                      </TableRow>
                    ))
                  ) : error ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-destructive py-8">
                        <div>
                          <p>Error loading discounts. Please try again.</p>
                          <p className="text-xs mt-2">{error instanceof Error ? error.message : String(error)}</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : discounts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        No discounts found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    discounts.map((discount: any) => (
                      <TableRow key={discount.id} className="hover:bg-muted/50">
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
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Pagination */}
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
        </CardContent>
      </Card>
    </div>
  );
};

