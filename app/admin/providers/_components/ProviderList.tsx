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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { getProviders } from "../_actions/getProviders";
import { getProviderById } from "../_actions/getProviderById";

interface Provider {
  id: string;
  provider_code: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: Date | null;
  accounts_count: number;
}

interface ProvidersResponse {
  providers: Provider[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const fetchProviders = async (
  page: number,
  search: string,
  status: string
): Promise<ProvidersResponse> => {
  const result = await getProviders({
    page,
    limit: 10,
    search,
    status: status as "active" | "inactive" | "all",
  });

  return {
    providers: result.providers as Provider[],
    total: result.total,
    page: result.page,
    limit: result.limit,
    totalPages: result.totalPages,
  };
};

export const ProviderList = () => {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

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

    const newUrl = `/admin/providers${params.toString() ? `?${params.toString()}` : ""}`;
    // Use replaceState to update URL without triggering navigation
    if (window.location.pathname + window.location.search !== newUrl) {
      window.history.replaceState({}, "", newUrl);
    }
  }, [debouncedSearch, status, page]);

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ["providers", page, debouncedSearch, status],
    queryFn: () => fetchProviders(page, debouncedSearch, status),
    retry: 1,
    keepPreviousData: true,
    staleTime: 30000,
  });

  const { data: selectedProvider, isLoading: isProviderLoading } = useQuery({
    queryKey: ["provider", selectedProviderId],
    queryFn: () => getProviderById(selectedProviderId!),
    enabled: !!selectedProviderId,
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

  const handleViewProvider = (providerId: string) => {
    setSelectedProviderId(providerId);
    setIsViewModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsViewModalOpen(false);
    setSelectedProviderId(null);
  };

  const providers = data?.providers || [];
  const totalPages = data?.totalPages || 1;
  const currentPage = data?.page || page;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search providers..."
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
        <Button onClick={() => router.push("/admin/providers/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Add Provider
        </Button>
      </div>

      <div className="rounded-md border relative">
        {isFetching && !isLoading && (
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary/20 z-10">
            <div className="h-full bg-primary animate-pulse" style={{ width: "30%" }} />
          </div>
        )}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Provider Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Accounts</TableHead>
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
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                </TableRow>
              ))
            ) : error ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <p className="text-destructive mb-2">Error loading providers</p>
                  <p className="text-sm text-muted-foreground">
                    {error instanceof Error ? error.message : "Please try again"}
                  </p>
                </TableCell>
              </TableRow>
            ) : providers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No providers found
                </TableCell>
              </TableRow>
            ) : (
              providers.map((provider) => (
                <TableRow key={provider.id}>
                  <TableCell className="font-medium">
                    {provider.provider_code}
                  </TableCell>
                  <TableCell>{provider.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {provider.description || "N/A"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {provider.accounts_count} account{provider.accounts_count !== 1 ? "s" : ""}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={provider.is_active ? "default" : "secondary"}
                      className={
                        provider.is_active
                          ? "bg-green-500/10 text-green-700 dark:text-green-400"
                          : "bg-gray-500/10 text-gray-700 dark:text-gray-400"
                      }
                    >
                      {provider.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {provider.created_at
                      ? new Date(provider.created_at).toLocaleDateString()
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
                              onClick={() => handleViewProvider(provider.id)}
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
                                router.push(`/admin/providers/${provider.id}/edit`)
                              }
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Edit Provider</p>
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

      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * 10 + 1} to{" "}
            {Math.min(currentPage * 10, data.total)} of {data.total} providers
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

      {/* View Provider Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Provider Details</DialogTitle>
          </DialogHeader>
          {isProviderLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ) : selectedProvider ? (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Provider Code</label>
                  <p className="font-medium">{selectedProvider.provider_code}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Name</label>
                  <p className="font-medium">{selectedProvider.name}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-muted-foreground">Description</label>
                  <p>{selectedProvider.description || "N/A"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <div>
                    <Badge
                      variant={selectedProvider.is_active ? "default" : "secondary"}
                      className={
                        selectedProvider.is_active
                          ? "bg-green-500/10 text-green-700 dark:text-green-400"
                          : "bg-gray-500/10 text-gray-700 dark:text-gray-400"
                      }
                    >
                      {selectedProvider.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Created</label>
                  <p>{selectedProvider.created_at ? new Date(selectedProvider.created_at).toLocaleDateString() : "N/A"}</p>
                </div>
              </div>
              {selectedProvider.config_schema && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Configuration Schema</label>
                  <div className="mt-2 p-3 bg-muted rounded-md">
                    {typeof selectedProvider.config_schema === 'object' ? (
                      <div className="space-y-2">
                        {Object.entries(selectedProvider.config_schema as Record<string, any>).map(([key, value]) => (
                          <div key={key} className="flex justify-between items-start">
                            <span className="font-medium text-sm">{key}:</span>
                            <span className="text-sm text-muted-foreground ml-2 text-right">
                              {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm">{String(selectedProvider.config_schema)}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p>Provider not found</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

