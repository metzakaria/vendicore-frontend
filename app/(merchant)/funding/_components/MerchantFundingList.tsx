"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
import { CalendarIcon, Filter, CheckCircle, Clock } from "lucide-react";
import { format } from "date-fns";
import { getMerchantFundingRequests } from "../_actions/getMerchantFundingRequests";
import { FundingDetailModal } from "./FundingDetailModal";

const fetchFundingRequests = async (
  page: number,
  status: string,
  amount: string,
  startDate: string,
  endDate: string
) => {
  const result = await getMerchantFundingRequests({
    page,
    limit: 20,
    status: status !== "all" ? (status as "approved" | "pending" | "rejected") : undefined,
    amount: amount || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  });

  return {
    fundings: result.fundings || [],
    total: result.total || 0,
    page: result.page || page,
    limit: result.limit || 20,
    totalPages: result.totalPages || 0,
  };
};

export const MerchantFundingList = () => {
  const [selectedFundingId, setSelectedFundingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Set today as default for dates
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);
  
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("all");
  const [startDate, setStartDate] = useState<Date | undefined>(today);
  const [endDate, setEndDate] = useState<Date | undefined>(todayEnd);
  const [page, setPage] = useState(1);
  
  // Active filter values (applied when button is clicked)
  const [activeAmount, setActiveAmount] = useState("");
  const [activeStatus, setActiveStatus] = useState("all");
  const [activeStartDate, setActiveStartDate] = useState<Date | undefined>(today);
  const [activeEndDate, setActiveEndDate] = useState<Date | undefined>(todayEnd);

  const handleRowClick = (fundingRef: string) => {
    setSelectedFundingId(fundingRef);
    setIsModalOpen(true);
  };

  // Initialize from URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initialAmount = params.get("amount") || "";
    setAmount(initialAmount);
    setActiveAmount(initialAmount);
    
    const initialStatus = params.get("status") || "all";
    setStatus(initialStatus);
    setActiveStatus(initialStatus);
    
    // Initialize dates from URL or use today as default
    const urlStartDate = params.get("startDate");
    const urlEndDate = params.get("endDate");
    if (urlStartDate) {
      const start = new Date(urlStartDate);
      setStartDate(start);
      setActiveStartDate(start);
    } else {
      setStartDate(today);
      setActiveStartDate(today);
    }
    if (urlEndDate) {
      const end = new Date(urlEndDate);
      end.setHours(23, 59, 59, 999);
      setEndDate(end);
      setActiveEndDate(end);
    } else {
      setEndDate(todayEnd);
      setActiveEndDate(todayEnd);
    }
    
    setPage(Number(params.get("page")) || 1);
  }, []);

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: [
      "merchant-funding-requests",
      page,
      activeStatus,
      activeAmount,
      activeStartDate?.toISOString() || null,
      activeEndDate?.toISOString() || null,
    ],
    queryFn: () =>
      fetchFundingRequests(
        page,
        activeStatus,
        activeAmount,
        activeStartDate ? activeStartDate.toISOString() : "",
        activeEndDate ? activeEndDate.toISOString() : ""
      ),
    retry: 1,
    staleTime: 30000,
  });

  const formatCurrency = (amount: string) => {
    return `₦${new Intl.NumberFormat("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(amount))}`;
  };

  const formatDateTime = (date: string | Date | null) => {
    if (!date) return "N/A";
    return format(new Date(date), "MMM dd, yyyy HH:mm");
  };

  const getStatusBadge = (funding: any) => {
    if (!funding.is_active) {
      return <Badge variant="destructive">Rejected</Badge>;
    }
    if (funding.is_approved) {
      return <Badge variant="default">Approved</Badge>;
    }
    return <Badge variant="secondary">Pending</Badge>;
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const fundings = data?.fundings || [];
  const totalPages = data?.totalPages || 1;
  const currentPage = data?.page || page;

  // Calculate summary
  const summary = fundings.reduce(
    (acc, funding) => {
      if (funding.is_approved && funding.is_active) {
        acc.approvedAmount += Number(funding.amount);
        acc.approvedCount += 1;
      } else if (!funding.is_approved && funding.is_active) {
        acc.pendingAmount += Number(funding.amount);
        acc.pendingCount += 1;
      }
      return acc;
    },
    { approvedAmount: 0, approvedCount: 0, pendingAmount: 0, pendingCount: 0 }
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Funding Requests</h2>
        <p className="text-muted-foreground">
          View and track your funding request history
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved Funding</CardTitle>
            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-indigo-700" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.approvedAmount.toString())}</div>
            <p className="text-xs text-muted-foreground mt-1">{summary.approvedCount} requests</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Funding</CardTitle>
            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
              <Clock className="h-6 w-6 text-indigo-700" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.pendingAmount.toString())}</div>
            <p className="text-xs text-muted-foreground mt-1">{summary.pendingCount} requests</p>
          </CardContent>
        </Card>
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
          <div className="grid gap-4 md:grid-cols-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "PPP") : "Start Date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "PPP") : "End Date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="number"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div className="mt-4 flex justify-end">
            <Button onClick={() => {
              // Apply filters when button is clicked
              setActiveAmount(amount);
              setActiveStatus(status);
              setActiveStartDate(startDate);
              setActiveEndDate(endDate);
              setPage(1);
              
              // Update URL
              const params = new URLSearchParams();
              if (amount) params.set("amount", amount);
              if (status !== "all") params.set("status", status);
              if (startDate) params.set("startDate", startDate.toISOString());
              if (endDate) params.set("endDate", endDate.toISOString());

              const newUrl = `/funding${params.toString() ? `?${params.toString()}` : ""}`;
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
          <CardTitle>Funding History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[140px]">Date</TableHead>
                    <TableHead className="w-[200px]">Description</TableHead>
                    <TableHead className="w-[120px]">Amount</TableHead>
                    <TableHead className="w-[120px]">Source</TableHead>
                    <TableHead className="w-[100px]">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                      </TableRow>
                    ))
                  ) : error ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-destructive py-8">
                        <div>
                          <p>Error loading funding requests. Please try again.</p>
                          <p className="text-xs mt-2">{error instanceof Error ? error.message : String(error)}</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : fundings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        No funding requests found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    fundings.map((funding: any) => (
                        <TableRow 
                          key={funding.id} 
                          className="hover:bg-muted/50 cursor-pointer"
                          onClick={() => handleRowClick(funding.id || funding.funding_ref)}
                        >
                          <TableCell className="text-sm">{formatDateTime(funding.created_at)}</TableCell>
                          <TableCell className="text-sm">{funding.description || "N/A"}</TableCell>
                          <TableCell className="text-sm font-medium">
                            {formatCurrency(funding.amount)}
                          </TableCell>
                          <TableCell className="text-sm capitalize">{funding.source}</TableCell>
                          <TableCell>{getStatusBadge(funding)}</TableCell>
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
        </CardContent>
      </Card>

      <FundingDetailModal
        fundingId={selectedFundingId}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </div>
  );
};

