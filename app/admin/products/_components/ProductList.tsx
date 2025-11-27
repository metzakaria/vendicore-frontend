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
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Search, Eye, Settings2 } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { getProducts } from "../_actions/getProducts";
import { getCategoriesForDropdown } from "../_actions/getCategoriesForDropdown";
import { getProviderAccountsForDropdown } from "../_actions/getProviderAccountsForDropdown";
import { quickUpdateProduct } from "../_actions/quickUpdateProduct";
import { getProductById } from "../_actions/getProductById";

interface Product {
  id: string;
  product_name: string;
  product_code: string;
  description: string;
  is_active: boolean;
  created_at: Date | null;
  vas_product_categories: {
    id: string;
    name: string;
    category_code: string;
  };
  preferred_provider_account: {
    id: string;
    account_name: string;
    vas_providers: {
      name: string;
      provider_code: string;
    };
  } | null;
}

interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const fetchProducts = async (
  page: number,
  search: string,
  status: string,
  categoryId: string
): Promise<ProductsResponse> => {
  const result = await getProducts({
    page,
    limit: 10,
    search,
    status: status as "active" | "inactive" | "all",
    category_id: categoryId && categoryId !== "all" ? categoryId : undefined,
  });

  return {
    products: result.products as Product[],
    total: result.total,
    page: result.page,
    limit: result.limit,
    totalPages: result.totalPages,
  };
};

export const ProductList = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [categoryId, setCategoryId] = useState("all");
  const [page, setPage] = useState(1);
  
  // View modal state
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewProductId, setViewProductId] = useState<string | null>(null);

  // Manage modal state
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [manageIsActive, setManageIsActive] = useState(false);
  const [manageProviderId, setManageProviderId] = useState("_none");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Fetch categories for dropdown
  const { data: categories } = useQuery({
    queryKey: ["product-categories"],
    queryFn: () => getCategoriesForDropdown(),
    staleTime: 300000, // 5 minutes
  });

  // Fetch provider accounts for dropdown
  const { data: providerAccounts } = useQuery({
    queryKey: ["provider-accounts-dropdown"],
    queryFn: () => getProviderAccountsForDropdown(),
    staleTime: 300000, // 5 minutes
  });

  // Fetch product details for view modal
  const { data: viewProduct, isLoading: viewProductLoading } = useQuery({
    queryKey: ["product-details", viewProductId],
    queryFn: () => getProductById(viewProductId!),
    enabled: !!viewProductId && isViewModalOpen,
    staleTime: 30000,
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initialSearch = params.get("search") || "";
    setSearch(initialSearch);
    setDebouncedSearch(initialSearch);
    setStatus(params.get("status") || "all");
    setCategoryId(params.get("category_id") || "all");
    setPage(Number(params.get("page")) || 1);
  }, []);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  // Update URL when debounced search changes (without page reload)
  useEffect(() => {
    // Skip initial render to prevent flicker
    if (debouncedSearch === "" && status === "all" && categoryId === "all" && page === 1) {
      return;
    }

    const params = new URLSearchParams();
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (status !== "all") params.set("status", status);
    if (categoryId !== "all") params.set("category_id", categoryId);
    if (page > 1) params.set("page", page.toString());

    const newUrl = `/admin/products${params.toString() ? `?${params.toString()}` : ""}`;
    // Use replaceState to update URL without triggering navigation
    if (window.location.pathname + window.location.search !== newUrl) {
      window.history.replaceState({}, "", newUrl);
    }
  }, [debouncedSearch, status, categoryId, page]);

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ["products", page, debouncedSearch, status, categoryId],
    queryFn: () => fetchProducts(page, debouncedSearch, status, categoryId),
    retry: 1,
    keepPreviousData: true,
    staleTime: 30000,
  });

  const handleSearch = (value: string) => {
    setSearch(value);
  };

  const handleStatusChange = (value: string) => {
    setStatus(value);
    setPage(1);
  };

  const handleCategoryChange = (value: string) => {
    setCategoryId(value);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleViewClick = (productId: string) => {
    setViewProductId(productId);
    setIsViewModalOpen(true);
  };

  const handleManageClick = (product: Product) => {
    setSelectedProduct(product);
    setManageIsActive(product.is_active);
    setManageProviderId(product.preferred_provider_account?.id || "_none");
    setSaveError(null);
    setIsManageModalOpen(true);
  };

  const handleSaveManage = async () => {
    if (!selectedProduct) return;
    
    setIsSaving(true);
    setSaveError(null);

    try {
      const result = await quickUpdateProduct(selectedProduct.id, {
        is_active: manageIsActive,
        preferred_provider_account_id: manageProviderId === "_none" ? null : manageProviderId,
      });

      if (result.success) {
        setIsManageModalOpen(false);
        queryClient.invalidateQueries({ queryKey: ["products"] });
      } else {
        setSaveError(result.error || "Failed to update product");
      }
    } catch (error: any) {
      setSaveError(error.message || "An error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  const products = data?.products || [];
  const totalPages = data?.totalPages || 1;
  const currentPage = data?.page || page;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Products</h2>
          <p className="text-muted-foreground">
            Manage products and their configurations
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-8"
          />
        </div>
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
        <Select value={categoryId} onValueChange={handleCategoryChange}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories?.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
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
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product Name</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Provider Account</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-4 w-[200px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[100px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[150px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[150px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[80px]" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="h-4 w-[80px]" />
                  </TableCell>
                </TableRow>
              ))
            ) : error ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-destructive">
                  Error loading products. Please try again.
                </TableCell>
              </TableRow>
            ) : products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No products found.
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.product_name}</TableCell>
                  <TableCell className="font-mono text-sm">{product.product_code}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{product.vas_product_categories.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {product.vas_product_categories.category_code}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {product.preferred_provider_account ? (
                      <div>
                        <div className="font-medium">
                          {product.preferred_provider_account.account_name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {product.preferred_provider_account.vas_providers.provider_code}
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Not set</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={product.is_active ? "default" : "secondary"}>
                      {product.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewClick(product.id)}
                        className="h-8 px-2"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleManageClick(product)}
                        className="h-8 px-2"
                      >
                        <Settings2 className="h-4 w-4 mr-1" />
                        Manage
                      </Button>
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
            Showing page {currentPage} of {totalPages} ({data?.total || 0} total products)
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

      {/* View Product Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={(open) => {
        setIsViewModalOpen(open);
        if (!open) setViewProductId(null);
      }}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Product Details</DialogTitle>
          </DialogHeader>
          {viewProductLoading ? (
            <div className="space-y-4 py-4">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          ) : viewProduct ? (
            <div className="space-y-6 py-4">
              {/* Basic Info */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{viewProduct.product_name}</h3>
                    <p className="text-sm text-muted-foreground font-mono">{viewProduct.product_code}</p>
                  </div>
                  <Badge variant={viewProduct.is_active ? "default" : "secondary"}>
                    {viewProduct.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                
                {viewProduct.description && (
                  <div>
                    <span className="text-xs text-muted-foreground">Description</span>
                    <p className="text-sm mt-1">{viewProduct.description}</p>
                  </div>
                )}
              </div>

              <Separator className="opacity-50" />

              {/* Category */}
              <div className="space-y-2">
                <span className="text-xs text-muted-foreground font-semibold uppercase">Category</span>
                <div>
                  <p className="text-sm font-medium">{viewProduct.vas_product_categories.name}</p>
                  <p className="text-xs text-muted-foreground">{viewProduct.vas_product_categories.category_code}</p>
                </div>
              </div>

              <Separator className="opacity-50" />

              {/* Provider Accounts */}
              <div className="space-y-4">
                <span className="text-xs text-muted-foreground font-semibold uppercase">Provider Configuration</span>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <span className="text-xs text-muted-foreground">Preferred Provider</span>
                    {viewProduct.preferred_provider_account ? (
                      <div className="mt-1">
                        <p className="text-sm font-medium">{viewProduct.preferred_provider_account.account_name}</p>
                        <p className="text-xs text-muted-foreground">{viewProduct.preferred_provider_account.vas_providers?.provider_code}</p>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground mt-1">Not set</p>
                    )}
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Backup Provider</span>
                    {viewProduct.backup_provider_account ? (
                      <div className="mt-1">
                        <p className="text-sm font-medium">{viewProduct.backup_provider_account.account_name}</p>
                        <p className="text-xs text-muted-foreground">{viewProduct.backup_provider_account.vas_providers?.provider_code}</p>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground mt-1">Not set</p>
                    )}
                  </div>
                </div>
              </div>

              <Separator className="opacity-50" />

              {/* Stats */}
              <div className="space-y-2">
                <span className="text-xs text-muted-foreground font-semibold uppercase">Statistics</span>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <span className="text-xs text-muted-foreground">Merchant Discounts</span>
                    <p className="text-sm font-medium mt-1">{viewProduct._count?.vas_merchant_discount || 0}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Created</span>
                    <p className="text-sm font-medium mt-1">
                      {viewProduct.created_at 
                        ? new Date(viewProduct.created_at).toLocaleDateString("en-NG", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : "N/A"
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <div className="flex justify-end pt-4">
                <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              Product not found
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Manage Product Modal */}
      <Dialog open={isManageModalOpen} onOpenChange={setIsManageModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Manage Product</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-6 py-4">
              {/* Product Info */}
              <div className="space-y-1">
                <p className="text-sm font-medium">{selectedProduct.product_name}</p>
                <p className="text-xs text-muted-foreground font-mono">{selectedProduct.product_code}</p>
              </div>

              {/* Status Toggle */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="is_active">Active Status</Label>
                  <p className="text-xs text-muted-foreground">
                    Enable or disable this product
                  </p>
                </div>
                <Switch
                  id="is_active"
                  checked={manageIsActive}
                  onCheckedChange={setManageIsActive}
                />
              </div>

              {/* Preferred Provider Account */}
              <div className="space-y-2">
                <Label htmlFor="provider_account">Preferred Provider Account</Label>
                <Select
                  value={manageProviderId}
                  onValueChange={setManageProviderId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select provider account" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none">None</SelectItem>
                    {providerAccounts?.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.account_name} ({account.vas_providers.provider_code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Primary provider account to use for this product
                </p>
              </div>

              {saveError && (
                <div className="text-sm text-destructive">{saveError}</div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsManageModalOpen(false)}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button onClick={handleSaveManage} disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

