"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
import { ArrowLeft, CalendarIcon, Download, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { getFundingReport } from "../../_actions/getFundingReport";
import { getMerchantsForDropdown } from "@/app/admin/funding/_actions/getMerchantsForDropdown";
import { exportToCsv } from "@/lib/utils/exportToCsv";

export const FundingReport = () => {
  const router = useRouter();
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [merchantId, setMerchantId] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [isExporting, setIsExporting] = useState(false);
  const [hasSearched, setHasSearched] = useState(false); // Only one declaration

  const { data: merchants } = useQuery({
    queryKey: ["merchants-dropdown"],
    queryFn: () => getMerchantsForDropdown(),
    staleTime: 300000,
  });

  const { data, isLoading, error } = useQuery({
    queryKey: [
      "funding-report",
      startDate?.toISOString(),
      endDate?.toISOString(),
      merchantId,
      status,
    ],
    queryFn: () =>
      getFundingReport({
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString(),
        merchantId: merchantId !== "all" ? merchantId : undefined,
        status: status as "all" | "approved" | "pending" | "rejected",
      }),
    enabled: hasSearched, // Only enable if filters have been applied
    staleTime: 30000,
  });

  // Effect to set hasSearched to true when any filter changes
  // This will trigger the data fetch
  // Effect to set hasSearched to false when any filter changes
  // This will prevent automatic refetching until "Apply Filters" is clicked.
  useEffect(() => {
    setHasSearched(false);
  }, [startDate, endDate, merchantId, status]);

  const handleApplyFilters = () => {
    setHasSearched(true);
  };

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
    }).format(Number(amount));
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

  const getStatusText = (funding: any) => {
    if (!funding.is_active) return "Rejected";
    if (funding.is_approved) return "Approved";
    return "Pending";
  };

  const handleExport = async () => {
    if (isExporting) return;
    
    setIsExporting(true);
    try {
      // Fetch all funding data with current filters
      const exportData = await getFundingReport({
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString(),
        merchantId: merchantId !== "all" ? merchantId : undefined,
        status: status as "all" | "approved" | "pending" | "rejected",
      });

      if (!exportData || !exportData.fundings || exportData.fundings.length === 0) {
        alert("No data to export");
        return;
      }

      // Transform data for CSV export
      const csvData = exportData.fundings.map((funding: any) => ({
        "Funding Reference": funding.funding_ref || "N/A",
        "Merchant Name": funding.vas_merchants?.business_name || "N/A",
        "Merchant Code": funding.vas_merchants?.merchant_code || "N/A",
        Amount: funding.amount || "0",
        Description: funding.description || "N/A",
        Status: getStatusText(funding),
        "Balance Before": funding.balance_before || "0",
        "Balance After": funding.balance_after || "0",
        Source: funding.source || "N/A",
        "Created At": formatDateTime(funding.created_at),
        "Created By": funding.vas_users_vas_merchant_funding_created_byTovas_users?.username || "N/A",
        "Approved At": formatDateTime(funding.approved_at),
        "Approved By": funding.vas_users_vas_merchant_funding_approved_byTovas_users?.username || "N/A",
        "Is Credited": funding.is_credited ? "Yes" : "No",
      }));

      exportToCsv(csvData, "funding_report");
    } catch (error) {
      console.error("Export error:", error);
      alert("Failed to export data. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/admin/reports")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Funding Report</h2>
            <p className="text-muted-foreground">
              Track all merchant funding requests and approvals
            </p>
          </div>
        </div>
        <Button onClick={handleExport} disabled={isExporting || !hasSearched}>
          {isExporting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Export
            </>
          )}
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Start Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : "Pick a date"}
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
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">End Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : "Pick a date"}
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
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Merchant</label>
              <Select value={merchantId} onValueChange={setMerchantId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select merchant" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Merchants</SelectItem>
                  {merchants?.map((merchant) => (
                    <SelectItem key={merchant.id} value={merchant.id}>
                      {merchant.business_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button onClick={handleApplyFilters} disabled={isLoading && hasSearched}>
              {isLoading && hasSearched && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Apply Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {!hasSearched ? (
        <Card className="flex items-center justify-center py-16">
          <p className="text-muted-foreground text-center">Apply filters to view report data.</p>
        </Card>
      ) : (
        <>
          {/* Summary */}
          {data && (
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Total Funding Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.summary.totalCount}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Total Funding Amount</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(data.summary.totalAmount)}</div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Table */}
          <Card>
            <CardHeader>
              <CardTitle>Funding Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead>Merchant</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created By</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading && hasSearched ? ( // Only show skeleton if loading after search
                      Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                        </TableRow>
                      ))
                    ) : error ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-destructive py-8">
                          Error loading funding report
                        </TableCell>
                      </TableRow>
                    ) : data?.fundings.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                          No funding requests found
                        </TableCell>
                      </TableRow>
                    ) : (
                      data?.fundings.map((funding: any) => (
                        <TableRow key={funding.id}>
                          <TableCell className="text-sm">
                            {formatDateTime(funding.created_at)}
                          </TableCell>
                          <TableCell className="font-mono text-sm">{funding.funding_ref}</TableCell>
                          <TableCell>
                            <div className="text-sm font-medium">
                              {funding.vas_merchants?.business_name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {funding.vas_merchants?.merchant_code}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm font-medium">
                            {formatCurrency(funding.amount)}
                          </TableCell>
                          <TableCell className="text-sm capitalize">{funding.source}</TableCell>
                          <TableCell>{getStatusBadge(funding)}</TableCell>
                          <TableCell className="text-sm">
                            {funding.vas_users_vas_merchant_funding_created_byTovas_users?.username || "N/A"}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

