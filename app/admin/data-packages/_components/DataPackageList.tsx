"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { Search, Plus, Eye, MoreHorizontal, Pencil, Upload } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { getDataPackages } from "../_actions/getDataPackages";
import { getProductsForDropdown } from "../_actions/getProductsForDropdown";

interface DataPackage {
  id: string;
  data_code: string;
  tariff_id: string | null;
  amount: string;
  description: string;
  duration: string;
  value: string;
  is_active: boolean;
  created_at: Date | null;
  vas_products: {
    id: string;
    product_name: string;
    product_code: string;
  };
}

interface DataPackagesResponse {
  packages: DataPackage[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const fetchDataPackages = async (
  page: number,
  search: string,
  status: string,
  productId: string
): Promise<DataPackagesResponse> => {
  const result = await getDataPackages({
    page,
    limit: 10,
    search,
    status: status as "active" | "inactive" | "all",
    product_id: productId && productId !== "all" ? productId : undefined,
  });

  return {
    packages: result.packages as DataPackage[],
    total: result.total,
    page: result.page,
    limit: result.limit,
    totalPages: result.totalPages,
  };
};

export const DataPackageList = () => {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [productId, setProductId] = useState("all");
  const [page, setPage] = useState(1);

  // Fetch products for dropdown
  const { data: products } = useQuery({
    queryKey: ["products-dropdown"],
    queryFn: () => getProductsForDropdown(),
    staleTime: 300000, // 5 minutes
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initialSearch = params.get("search") || "";
    setSearch(initialSearch);
    setDebouncedSearch(initialSearch);
    setStatus(params.get("status") || "all");
    setProductId(params.get("product_id") || "all");
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
    if (debouncedSearch === "" && status === "all" && productId === "all" && page === 1) {
      return;
    }

    const params = new URLSearchParams();
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (status !== "all") params.set("status", status);
    if (productId !== "all") params.set("product_id", productId);
    if (page > 1) params.set("page", page.toString());

    const newUrl = `/admin/data-packages${params.toString() ? `?${params.toString()}` : ""}`;
    // Use replaceState to update URL without triggering navigation
    if (window.location.pathname + window.location.search !== newUrl) {
      window.history.replaceState({}, "", newUrl);
    }
  }, [debouncedSearch, status, productId, page]);

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ["dataPackages", page, debouncedSearch, status, productId],
    queryFn: () => fetchDataPackages(page, debouncedSearch, status, productId),
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

  const handleProductChange = (value: string) => {
    setProductId(value);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
    }).format(Number(amount));
  };

  const packages = data?.packages || [];
  const totalPages = data?.totalPages || 1;
  const currentPage = data?.page || page;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Data Packages</h2>
          <p className="text-muted-foreground">
            Manage data packages for products
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => router.push("/admin/data-packages/import")}
          >
            <Upload className="mr-2 h-4 w-4" />
            Import CSV
          </Button>
          <Button onClick={() => router.push("/admin/data-packages/new")}>
            <Plus className="mr-2 h-4 w-4" />
            Add Package
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search packages..."
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
              <TableHead>Data Code</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-4 w-[120px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[150px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[100px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[80px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[80px]" />
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
                <TableCell colSpan={7} className="text-center text-destructive">
                  Error loading data packages. Please try again.
                </TableCell>
              </TableRow>
            ) : packages.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  No data packages found.
                </TableCell>
              </TableRow>
            ) : (
              packages.map((pkg) => (
                <TableRow key={pkg.id}>
                  <TableCell className="font-mono font-medium">{pkg.data_code}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{pkg.vas_products.product_name}</div>
                      <div className="text-xs text-muted-foreground">
                        {pkg.vas_products.product_code}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{formatCurrency(pkg.amount)}</TableCell>
                  <TableCell>{pkg.value}</TableCell>
                  <TableCell>{pkg.duration}</TableCell>
                  <TableCell>
                    <Badge variant={pkg.is_active ? "default" : "secondary"}>
                      {pkg.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => router.push(`/admin/data-packages/${pkg.id}`)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => router.push(`/admin/data-packages/${pkg.id}/edit`)}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
            Showing page {currentPage} of {totalPages} ({data?.total || 0} total packages)
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
    </div>
  );
};

