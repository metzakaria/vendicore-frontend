"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getFundingRequests } from "../_actions/getFundingRequests";
import { getMerchantsForDropdown } from "../_actions/getMerchantsForDropdown";
import { FundingTable } from "./FundingTable";

interface FundingRequest {
  funding_ref: string;
  amount: string;
  balance_before: string;
  balance_after: string;
  description: string;
  source: string;
  is_approved: boolean;
  is_credited: boolean;
  is_active: boolean;
  created_at: Date | null;
  approved_at: Date | null;
  vas_merchants: {
    id: string;
    merchant_code: string;
    business_name: string;
    current_balance: string;
  };
  vas_users_vas_merchant_funding_created_byTovas_users: {
    id: string;
    username: string;
    email: string;
  };
  vas_users_vas_merchant_funding_approved_byTovas_users: {
    id: string;
    username: string;
    email: string;
  } | null;
}

interface FundingRequestsResponse {
  fundingRequests: FundingRequest[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const fetchFundingRequests = async (
  page: number,
  search: string,
  status: string,
  merchantId: string
): Promise<FundingRequestsResponse> => {
  const result = await getFundingRequests({
    page,
    limit: 10,
    search,
    status: status as "all" | "pending" | "approved" | "rejected",
    merchant_id: merchantId && merchantId !== "all" ? merchantId : undefined,
  });

  return {
    fundingRequests: result.fundingRequests as FundingRequest[],
    total: result.total,
    page: result.page,
    limit: result.limit,
    totalPages: result.totalPages,
  };
};

export const FundingList = () => {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [merchantId, setMerchantId] = useState("all");
  const [page, setPage] = useState(1);

  // Fetch merchants for dropdown
  const { data: merchants } = useQuery({
    queryKey: ["merchants-dropdown"],
    queryFn: () => getMerchantsForDropdown(),
    staleTime: 300000,
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initialSearch = params.get("search") || "";
    setSearch(initialSearch);
    setDebouncedSearch(initialSearch);
    setStatus(params.get("status") || "all");
    setMerchantId(params.get("merchant_id") || "all");
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

  // Update URL when filters change
  useEffect(() => {
    if (debouncedSearch === "" && status === "all" && merchantId === "all" && page === 1) {
      return;
    }

    const params = new URLSearchParams();
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (status !== "all") params.set("status", status);
    if (merchantId !== "all") params.set("merchant_id", merchantId);
    if (page > 1) params.set("page", page.toString());

    const newUrl = `/admin/funding${params.toString() ? `?${params.toString()}` : ""}`;
    if (window.location.pathname + window.location.search !== newUrl) {
      window.history.replaceState({}, "", newUrl);
    }
  }, [debouncedSearch, status, merchantId, page]);

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ["funding-requests", page, debouncedSearch, status, merchantId],
    queryFn: () => fetchFundingRequests(page, debouncedSearch, status, merchantId),
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

  const handleMerchantChange = (value: string) => {
    setMerchantId(value);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleViewDetails = (fundingRef: string) => {
    router.push(`/admin/funding/${fundingRef}`);
  };

  const fundingRequests = data?.fundingRequests || [];
  const totalPages = data?.totalPages || 1;
  const currentPage = data?.page || page;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Merchant Funding</h2>
          <p className="text-muted-foreground">
            Manage merchant funding requests and approvals
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search funding requests..."
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
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
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

      {/* Funding Table */}
      <FundingTable
        fundingRequests={fundingRequests}
        isLoading={isLoading}
        error={error}
        showAddButton={true}
        showMerchantSelection={true}
        merchants={merchants}
        onViewDetails={handleViewDetails}
        queryKey={["funding-requests", page, debouncedSearch, status, merchantId]}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing page {currentPage} of {totalPages} ({data?.total || 0} total requests)
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

