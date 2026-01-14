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
import { getProviderAccounts } from "../_actions/getProviderAccounts";
import { getProvidersForDropdown } from "../_actions/getProvidersForDropdown";
import { getProviderAccountById } from "../_actions/getProviderAccountById";
import { TableOverlayLoader } from "@/components/ui/table-overlay-loader";

interface ProviderAccount {
  id: string;
  account_name: string;
  available_balance: number;
  balance_at_provider: number;
  vending_sim: string | null;
  created_at: Date | null;
  vas_providers: {
    id: string;
    name: string;
    provider_code: string;
  };
}

interface ProviderAccountsResponse {
  accounts: ProviderAccount[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const fetchProviderAccounts = async (
  page: number,
  search: string,
  providerId: string
): Promise<ProviderAccountsResponse> => {
  const result = await getProviderAccounts({
    page,
    limit: 10,
    search,
    provider_id: providerId && providerId !== "all" ? providerId : undefined,
  });

  return {
    accounts: result.accounts as ProviderAccount[],
    total: result.total,
    page: result.page,
    limit: result.limit,
    totalPages: result.totalPages,
  };
};

export const ProviderAccountList = () => {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [providerId, setProviderId] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Fetch providers for dropdown
  const { data: providers } = useQuery({
    queryKey: ["providers-dropdown"],
    queryFn: () => getProvidersForDropdown(),
    staleTime: 300000, // 5 minutes
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initialSearch = params.get("search") || "";
    setSearch(initialSearch);
    setDebouncedSearch(initialSearch);
    setProviderId(params.get("provider_id") || "all");
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
    if (debouncedSearch === "" && providerId === "all" && page === 1) {
      return;
    }

    const params = new URLSearchParams();
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (providerId !== "all") params.set("provider_id", providerId);
    if (page > 1) params.set("page", page.toString());

    const newUrl = `/admin/providers${params.toString() ? `?${params.toString()}` : ""}`;
    // Use replaceState to update URL without triggering navigation
    if (window.location.pathname + window.location.search !== newUrl) {
      window.history.replaceState({}, "", newUrl);
    }
  }, [debouncedSearch, providerId, page]);

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ["providerAccounts", page, debouncedSearch, providerId],
    queryFn: () => fetchProviderAccounts(page, debouncedSearch, providerId),
    retry: 1,
    keepPreviousData: true,
    staleTime: 30000,
  });

  const { data: selectedAccount, isLoading: isAccountLoading } = useQuery({
    queryKey: ["providerAccount", selectedAccountId],
    queryFn: () => getProviderAccountById(selectedAccountId!),
    enabled: !!selectedAccountId,
    staleTime: 30000,
  });

  const handleSearch = (value: string) => {
    setSearch(value);
  };

  const handleProviderChange = (value: string) => {
    setProviderId(value);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleViewAccount = (accountId: string) => {
    setSelectedAccountId(accountId);
    setIsViewModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsViewModalOpen(false);
    setSelectedAccountId(null);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const accounts = data?.accounts || [];
  const totalPages = data?.totalPages || 1;
  const currentPage = data?.page || page;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search accounts..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={providerId} onValueChange={handleProviderChange}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by provider" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Providers</SelectItem>
            {providers?.map((provider) => (
              <SelectItem key={provider.id} value={provider.id}>
                {provider.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={() => router.push("/admin/providers/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Add Account
        </Button>
      </div>

      <div className="rounded-md border relative">
        <TableOverlayLoader isVisible={isLoading || isFetching} />
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Account Name</TableHead>
              <TableHead>Provider</TableHead>
              <TableHead>Available Balance</TableHead>
              <TableHead>Balance at Provider</TableHead>
              <TableHead>Vending SIM</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {error ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <p className="text-destructive mb-2">Error loading provider accounts</p>
                  <p className="text-sm text-muted-foreground">
                    {error instanceof Error ? error.message : "Please try again"}
                  </p>
                </TableCell>
              </TableRow>
            ) : accounts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No provider accounts found
                </TableCell>
              </TableRow>
            ) : (
              accounts.map((account) => (
                <TableRow key={account.id}>
                  <TableCell className="font-medium">
                    {account.account_name}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{account.vas_providers.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {account.vas_providers.provider_code}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono">
                      {formatCurrency(account.available_balance)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono">
                      {formatCurrency(account.balance_at_provider)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {account.vending_sim || "N/A"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {account.created_at
                      ? new Date(account.created_at).toLocaleDateString()
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
                              onClick={() => handleViewAccount(account.id)}
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
                                router.push(`/admin/providers/${account.id}/edit`)
                              }
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Edit Account</p>
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
            {Math.min(currentPage * 10, data.total)} of {data.total} accounts
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

      {/* View Provider Account Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Provider Account Details</DialogTitle>
          </DialogHeader>
          {isAccountLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ) : selectedAccount ? (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Account Name</label>
                  <p className="font-medium">{selectedAccount.account_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Provider</label>
                  <p className="font-medium">{selectedAccount.vas_providers?.name}</p>
                  <p className="text-xs text-muted-foreground">{selectedAccount.vas_providers?.provider_code}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Available Balance</label>
                  <p className="font-medium">{new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(selectedAccount.available_balance)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Balance at Provider</label>
                  <p className="font-medium">{new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(selectedAccount.balance_at_provider)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Vending SIM</label>
                  <p>{selectedAccount.vending_sim || "N/A"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Created</label>
                  <p>{selectedAccount.created_at ? new Date(selectedAccount.created_at).toLocaleDateString() : "N/A"}</p>
                </div>
              </div>
              {selectedAccount.config && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Configuration</label>
                  <div className="mt-2 p-3 bg-muted rounded-md">
                    {typeof selectedAccount.config === 'object' ? (
                      <div className="space-y-2 w-full">
                        {Object.entries(selectedAccount.config as Record<string, any>).map(([key, value]) => (
                          <div key={key} className="grid grid-cols-[auto_1fr] items-start gap-x-2">
                            <span className="font-medium text-sm">{key}:</span>
                            <span className="text-sm text-muted-foreground break-all max-w-full">
                              {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm break-all max-w-full">{String(selectedAccount.config)}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p>Provider account not found</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

