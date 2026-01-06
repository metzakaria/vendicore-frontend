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
import { Search, Plus, Eye, Pencil } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { getMerchants } from "../_actions/getMerchants";
import { TableOverlayLoader } from "@/components/ui/table-overlay-loader";

interface Merchant {
  id: string;
  merchant_code: string;
  business_name: string;
  current_balance: string;
  daily_tranx_limit: string | null;
  is_active: boolean;
  created_at: Date | null;
  vas_users: {
    email: string;
    username: string;
  } | null;
}

interface MerchantsResponse {
  merchants: Merchant[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const fetchMerchants = async (
  page: number,
  search: string,
  status: string
): Promise<MerchantsResponse> => {
  const result = await getMerchants({
    page,
    limit: 10,
    search,
    status: status as "active" | "inactive" | "all",
  });

  return {
    merchants: result.merchants as Merchant[],
    total: result.total,
    page: result.page,
    limit: result.limit,
    totalPages: result.totalPages,
  };
};

export const MerchantList = () => {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initialSearch = params.get("search") || "";
    setSearch(initialSearch);
    setDebouncedSearch(initialSearch);
    setStatus(params.get("status") || "all");
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
    if (debouncedSearch === "" && status === "all" && page === 1) {
      return;
    }

    const params = new URLSearchParams();
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (status !== "all") params.set("status", status);
    if (page > 1) params.set("page", page.toString());

    const newUrl = `/admin/merchants${params.toString() ? `?${params.toString()}` : ""}`;
    // Use replaceState to update URL without triggering navigation
    if (window.location.pathname + window.location.search !== newUrl) {
      window.history.replaceState({}, "", newUrl);
    }
  }, [debouncedSearch, status, page]);

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ["merchants", page, debouncedSearch, status],
    queryFn: () => fetchMerchants(page, debouncedSearch, status),
    retry: 1,
    staleTime: 30000,
  });

  const handleSearch = (value: string) => {
    setSearch(value);
  };

  const handleStatusChange = (value: string) => {
    setStatus(value);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const formatCurrency = (amount: any) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
    }).format(Number(amount));
  };

  const merchants = data?.merchants || [];
  const totalPages = data?.totalPages || 1;
  const currentPage = data?.currentPage || page;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search merchants..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={status} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={() => router.push("/admin/merchants/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Add Merchant
        </Button>
      </div>

      <div className="relative rounded-md border">
        <TableOverlayLoader
          isVisible={isLoading || isFetching}
          label={isLoading ? "Loading merchants..." : "Updating merchants..."}
        />
        <div className="w-full overflow-x-auto">
          <Table className="min-w-[720px] text-xs sm:text-sm">
          <TableHeader>
            <TableRow>
              <TableHead>Business Name</TableHead>
              <TableHead>Balance</TableHead>
              <TableHead>Daily Limit</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && !data ? (
              // Initial load - show skeleton
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                </TableRow>
              ))
            ) : error ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <p className="text-destructive mb-2">Error loading merchants</p>
                  <p className="text-sm text-muted-foreground">
                    {error instanceof Error ? error.message : "Please try again"}
                  </p>
                </TableCell>
              </TableRow>
            ) : merchants.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No merchants found
                </TableCell>
              </TableRow>
            ) : (
              merchants.map((merchant) => (
                <TableRow key={merchant.id}>
                  <TableCell>
                    <div className="font-medium">{merchant.business_name}</div>
                    <div className="text-xs text-muted-foreground">{merchant.merchant_code}</div>
                  </TableCell>
                  <TableCell>{formatCurrency(merchant.current_balance)}</TableCell>
                  <TableCell>
                    {merchant.daily_tranx_limit 
                      ? formatCurrency(merchant.daily_tranx_limit) 
                      : "N/A"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={merchant.is_active ? "default" : "secondary"}
                      className={
                        merchant.is_active
                          ? "bg-green-500/10 text-green-700 dark:text-green-400"
                          : "bg-gray-500/10 text-gray-700 dark:text-gray-400"
                      }
                    >
                      {merchant.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {merchant.created_at
                      ? new Date(merchant.created_at).toLocaleDateString()
                      : "N/A"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() =>
                                router.push(`/admin/merchants/${merchant.id}`)
                              }
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>View Details</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() =>
                                router.push(`/admin/merchants/${merchant.id}/edit`)
                              }
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Edit Merchant</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        </div>
      </div>

      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * 10 + 1} to{" "}
            {Math.min(currentPage * 10, data.total)} of {data.total} merchants
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
              disabled={currentPage >= data.totalPages || isFetching}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

