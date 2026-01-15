"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, CalendarIcon, TrendingUp, DollarSign, Users, Package, Filter, Download, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { getSummaryReport } from "../../_actions/getSummaryReport";
import { exportToCsv } from "@/lib/utils/exportToCsv";

export const SummaryReport = ({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) => {
  const router = useRouter();
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [isExporting, setIsExporting] = useState(false);
  const [hasSearched, setHasSearched] = useState(() => {
    if (searchParams) {
      const params = new URLSearchParams(searchParams as Record<string, string>);
      const start = params.get("startDate");
      const end = params.get("endDate");
      return !!(start || end);
    }
    return false;
  });

  useEffect(() => {
    if (searchParams) {
      const params = new URLSearchParams(searchParams as Record<string, string>);
      const start = params.get("startDate");
      const end = params.get("endDate");

      setStartDate(start ? new Date(start) : undefined);
      setEndDate(end ? new Date(end) : undefined);
    }
  }, [searchParams]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["summary-report", startDate?.toISOString(), endDate?.toISOString()],
    queryFn: () =>
      getSummaryReport({
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString(),
      }),
    enabled: hasSearched,
    staleTime: 30000,
  });

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
    }).format(Number(amount));
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (startDate) params.set("startDate", startDate.toISOString());
    if (endDate) params.set("endDate", endDate.toISOString());
    
    setHasSearched(true);
    router.push(`?${params.toString()}`);
  };

  const handleExport = async () => {
    if (isExporting) return;
    
    setIsExporting(true);
    try {
      const exportData = await getSummaryReport({
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString(),
      });

      if (!exportData) {
        alert("No data to export");
        return;
      }

      const csvData = [
        {
          Metric: "Total Transactions",
          Value: exportData.transactions.total || 0,
        },
        {
          Metric: "Success Rate",
          Value: exportData.transactions.successRate || "0%",
        },
        {
          Metric: "Transaction Volume",
          Value: formatCurrency(exportData.transactions.totalAmount || "0"),
        },
        {
          Metric: "Active Merchants",
          Value: exportData.merchants.active || 0,
        },
        {
          Metric: "Active Products",
          Value: exportData.products.active || 0,
        },
        {
          Metric: "Total Funding Requests",
          Value: exportData.funding.total || 0,
        },
        {
          Metric: "Total Funding Amount",
          Value: formatCurrency(exportData.funding.totalAmount || "0"),
        },
      ];

      exportToCsv(csvData, "summary_report");
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
            <h2 className="text-3xl font-bold tracking-tight">Summary Report</h2>
            <p className="text-muted-foreground">
              Comprehensive overview of platform metrics
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

      {/* Date Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Date Range
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Start Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
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
                  <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
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
          </div>
          <Button onClick={handleSearch}>
            <Filter className="mr-2 h-4 w-4" />
            Search
          </Button>
        </CardContent>
      </Card>

      {/* Conditional rendering for report data or "no search" message */}
      {!hasSearched ? (
        <Card className="flex items-center justify-center py-16">
          <CardContent className="text-center text-muted-foreground text-lg">
            Please select a date range and click &quot;Search&quot; to view the summary report.
          </CardContent>
        </Card>
      ) : isLoading ? (
        <Card className="flex items-center justify-center py-16">
          <CardContent className="text-center text-muted-foreground text-lg flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading report...
          </CardContent>
        </Card>
      ) : error ? (
        <Card className="flex items-center justify-center py-16">
          <CardContent className="text-center text-destructive text-lg">
            Error loading report: {(error as Error).message}
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data?.transactions.total || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {data?.transactions.successRate || "0%"} success rate
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Transaction Volume</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(data?.transactions.totalAmount || "0")}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Merchants</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data?.merchants.active || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Products</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data?.products.active || 0}</div>
              </CardContent>
            </Card>
          </div>

          {/* Transaction Status Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Transaction Status Breakdown</CardTitle>
              <CardDescription>Distribution of transactions by status</CardDescription>
            </CardHeader>
            <CardContent>
              {data?.transactions.statusBreakdown.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  No status breakdown data found for the selected filters.
                </div>
              ) : (
                <div className="space-y-4">
                  {data?.transactions.statusBreakdown.map((stat: any) => (
                    <div key={stat.status} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-primary" />
                        <span className="text-sm font-medium capitalize">{stat.status}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">{stat.count} transactions</span>
                        <div className="w-[200px] bg-secondary rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{
                              width: `${(stat.count / (data?.transactions.total || 1)) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Funding Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Funding Summary</CardTitle>
              <CardDescription>Total funding requests and amounts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Total Funding Requests</p>
                  <p className="text-2xl font-bold">{data?.funding.total || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Funding Amount</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(data?.funding.totalAmount || "0")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};