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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, CalendarIcon, Download, Loader2, Filter } from "lucide-react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { getRevenueReport } from "../../_actions/getRevenueReport";
import { exportToCsv } from "@/lib/utils/exportToCsv";
import { getProductsForDropdown } from "../_actions/getProductsForDropdown";
import { getMerchantsForDropdown } from "@/app/admin/funding/_actions/getMerchantsForDropdown";

export const ProductReport = ({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) => {
  const router = useRouter();
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [merchantId, setMerchantId] = useState<string>("all");
  const [productId, setProductId] = useState<string>("all");
  const [isExporting, setIsExporting] = useState(false);
  const [hasSearched, setHasSearched] = useState(() => {
    if (searchParams) {
      const params = new URLSearchParams(searchParams as Record<string, string>);
      const start = params.get("startDate");
      const end = params.get("endDate");
      const merchant = params.get("merchantId");
      const product = params.get("productId");
      return !!(start || end || (merchant && merchant !== "all") || (product && product !== "all"));
    }
    return false;
  });

  useEffect(() => {
    if (searchParams) {
      const params = new URLSearchParams(searchParams as Record<string, string>);
      const start = params.get("startDate");
      const end = params.get("endDate");
      const merchant = params.get("merchantId");
      const product = params.get("productId");

      setStartDate(start ? new Date(start) : undefined);
      setEndDate(end ? new Date(end) : undefined);
      setMerchantId(merchant || "all");
      setProductId(product || "all");

      // Only set hasSearched to true if meaningful filters are present in the URL
      // Do not set to false here, as handleSearch already sets it to true
      // and subsequent re-renders should maintain that state if the URL has parameters.
      if (start || end || (merchant && merchant !== "all") || (product && product !== "all")) {
        setHasSearched(true);
      }
    }
  }, [searchParams]);

  const { data: merchants } = useQuery({
    queryKey: ["merchants-dropdown"],
    queryFn: () => getMerchantsForDropdown(),
    staleTime: 300000,
  });

  const { data: products } = useQuery({
    queryKey: ["products-dropdown"],
    queryFn: () => getProductsForDropdown(),
    staleTime: 300000,
  });

  const { data, isLoading, error } = useQuery({
    queryKey: [
      "product-report",
      startDate?.toISOString(),
      endDate?.toISOString(),
      merchantId,
      productId,
    ],
    queryFn: () =>
      getRevenueReport({ // This seems incorrect, should be getProductReport
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString(),
        merchantId: merchantId !== "all" ? merchantId : undefined,
        productId: productId !== "all" ? productId : undefined,
      }),
    enabled: hasSearched,
    staleTime: 30000,
  });

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (startDate) params.set("startDate", startDate.toISOString());
    if (endDate) params.set("endDate", endDate.toISOString());
    if (merchantId !== "all") params.set("merchantId", merchantId);
    if (productId !== "all") params.set("productId", productId);
    
    setHasSearched(true);
    router.push(`?${params.toString()}`);
  };

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
    }).format(Number(amount));
  };

  const handleExport = async () => {
    if (isExporting) return;
    
    setIsExporting(true);
    try {
      // Fetch all product data with current filters
      const exportData = await getRevenueReport({ // This seems incorrect, should be getProductReport
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString(),
        merchantId: merchantId !== "all" ? merchantId : undefined,
        productId: productId !== "all" ? productId : undefined,
      });

      if (!exportData || !exportData.productRevenue || exportData.productRevenue.length === 0) {
        alert("No data to export");
        return;
      }

      // Transform data for CSV export
      const csvData = exportData.productRevenue.map((product: any) => {
        const avgRevenue = Number(product.total_amount) / product.transaction_count || 0;
        return {
          "Product Name": product.product_name || "N/A",
          "Product Code": product.product_code || "N/A",
          "Total Transactions": product.transaction_count || "0",
          "Total Revenue": product.total_amount || "0",
          "Average Revenue": avgRevenue.toString(),
        };
      });

      exportToCsv(csvData, "product_usage_report");
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
            <h2 className="text-3xl font-bold tracking-tight">Product Usage Report</h2>
            <p className="text-muted-foreground">
              Product performance and usage statistics
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
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-4">
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
              <label className="text-sm font-medium">Product</label>
              <Select value={productId} onValueChange={setProductId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select product" />
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
          </div>
          <div className="mt-4 flex justify-end">
            <Button onClick={handleSearch}>
              <Filter className="mr-2 h-4 w-4" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Conditional rendering for report data or "no search" message */}
      {!hasSearched ? (
        <Card className="flex items-center justify-center py-16">
          <CardContent className="text-center text-muted-foreground text-lg">
            Please use the filters above and click &quot;Search&quot; to view product usage.
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Product Performance Table */}
          <Card>
            <CardHeader>
              <CardTitle>Product Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product Name</TableHead>
                      <TableHead>Product Code</TableHead>
                      <TableHead>Total Transactions</TableHead>
                      <TableHead>Total Revenue</TableHead>
                      <TableHead>Average Revenue</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                        </TableRow>
                      ))
                    ) : error ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-destructive py-8">
                          Error loading product report
                        </TableCell>
                      </TableRow>
                    ) : data?.productRevenue.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                          No product data found for the selected filters.
                        </TableCell>
                      </TableRow>
                    ) : (
                      data?.productRevenue.map((product: any) => {
                        const avgRevenue = Number(product.total_amount) / product.transaction_count || 0;
                        return (
                          <TableRow key={product.product_id}>
                            <TableCell className="font-medium">{product.product_name}</TableCell>
                            <TableCell className="font-mono text-sm">{product.product_code}</TableCell>
                            <TableCell>{product.transaction_count}</TableCell>
                            <TableCell className="font-medium">
                              {formatCurrency(product.total_amount)}
                            </TableCell>
                            <TableCell>{formatCurrency(avgRevenue.toString())}</TableCell>
                          </TableRow>
                        );
                      })
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

