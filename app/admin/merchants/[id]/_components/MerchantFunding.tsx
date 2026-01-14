"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { getFundingRequests } from "@/app/admin/funding/_actions/getFundingRequests";
import { FundingTable } from "@/app/admin/funding/_components/FundingTable";

interface MerchantFundingProps {
  merchantId: string;
}

const fetchFundingRequests = async (
  merchantId: string,
  page: number,
  status: string,
  search: string,
  hideAutoReversal: boolean
) => {
  const result = await getFundingRequests({
    page,
    limit: 10,
    merchant_id: merchantId,
    status: status as "all" | "pending" | "approved" | "rejected",
    search: search.trim() || undefined,
    hideAutoReversal: hideAutoReversal || undefined,
  });

  return {
    fundingRequests: result.fundingRequests || [],
    total: result.total || 0,
    page: result.page || page,
    limit: result.limit || 10,
    totalPages: result.totalPages || 0,
  };
};

export const MerchantFunding = ({ merchantId }: MerchantFundingProps) => {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [hideAutoReversal, setHideAutoReversal] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeHideAutoReversal, setActiveHideAutoReversal] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setPage(Number(params.get("fundingPage")) || 1);
    setStatus(params.get("fundingStatus") || "all");
    setSearch(params.get("fundingSearch") || "");
    setDebouncedSearch(params.get("fundingSearch") || "");
    setActiveHideAutoReversal(params.get("fundingHideAutoReversal") === "true");
    setHideAutoReversal(params.get("fundingHideAutoReversal") === "true");
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
    const params = new URLSearchParams(window.location.search);
    if (debouncedSearch) params.set("fundingSearch", debouncedSearch);
    else params.delete("fundingSearch");
    if (status !== "all") params.set("fundingStatus", status);
    else params.delete("fundingStatus");
    if (page > 1) params.set("fundingPage", page.toString());
    else params.delete("fundingPage");
    if (activeHideAutoReversal) params.set("fundingHideAutoReversal", "true");
    else params.delete("fundingHideAutoReversal");

    window.history.replaceState(
      {},
      "",
      `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ""}`
    );
  }, [debouncedSearch, status, page, activeHideAutoReversal]);

  const { data, isLoading, error: queryError } = useQuery({
    queryKey: ["merchant-funding", merchantId, page, status, debouncedSearch, activeHideAutoReversal],
    queryFn: () => fetchFundingRequests(merchantId, page, status, debouncedSearch, activeHideAutoReversal),
    retry: 1,
    staleTime: 30000,
  });

  const handleViewDetails = () => {
    // View details handled by FundingTable component
  };

  const fundingRequests = data?.fundingRequests || [];
  const totalPages = data?.totalPages || 1;
  const currentPage = data?.page || page;

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleStatusChange = (value: string) => {
    setStatus(value);
    setPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Funding</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search funding..."
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
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
            <div className="flex items-center space-x-2">
              <Checkbox
                id="hideAutoReversal"
                checked={hideAutoReversal}
                onCheckedChange={(checked) => {
                  setHideAutoReversal(checked as boolean);
                  setActiveHideAutoReversal(checked as boolean);
                  setPage(1);
                }}
              />
              <Label htmlFor="hideAutoReversal">Hide auto reversal</Label>
            </div>
          </div>

          {/* Funding Table */}
          <FundingTable
            fundingRequests={fundingRequests}
            isLoading={isLoading}
            error={queryError}
            showAddButton={true}
            showMerchantSelection={false}
            merchantId={merchantId}
            onViewDetails={handleViewDetails}
            queryKey={["merchant-funding", merchantId, page.toString(), status, debouncedSearch]}
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
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};