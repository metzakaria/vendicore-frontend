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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, CalendarIcon, Download, Filter, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { getTransactionReport } from "../../_actions/getTransactionReport";
import { getMerchantsForDropdown } from "@/app/admin/funding/_actions/getMerchantsForDropdown";
import { getProductsForDropdown } from "../../_actions/getProductsForDropdown";
import { exportToCsv } from "@/lib/utils/exportToCsv";
import { TableOverlayLoader } from "@/components/ui/table-overlay-loader";

export const TransactionReport = () => {
  const router = useRouter();
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [merchantId, setMerchantId] = useState<string>("all");
  const [productId, setProductId] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [amount, setAmount] = useState<string>("");
  const [page, setPage] = useState(1);
  const [isExporting, setIsExporting] = useState(false);

  // Fetch merchants and products for dropdowns
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

  // Fetch report data
  const { data, isLoading, error } = useQuery({
    queryKey: [
      "transaction-report",
      page,
      startDate?.toISOString(),
      endDate?.toISOString(),
      merchantId,
      productId,
      status,
      amount,
    ],
    queryFn: () =>
      getTransactionReport({
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString(),
        merchantId: merchantId !== "all" ? merchantId : undefined,
        productId: productId !== "all" ? productId : undefined,
        status: status !== "all" ? status : undefined,
        amount: amount.trim() !== "" ? amount : undefined,
        page,
        limit: 50,
      }),
    enabled: true,
    staleTime: 30000,
  });

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

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      success: "default",
      failed: "destructive",
      pending: "secondary",
    };
    return (
      <Badge variant={variants[status] || "outline"}>{status.toUpperCase()}</Badge>
    );
  };

  const handleExport = async () => {
    if (isExporting) return;
    
    setIsExporting(true);
    try {
      // Fetch all transactions with current filters (no pagination)
      const exportData = await getTransactionReport({
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString(),
        merchantId: merchantId !== "all" ? merchantId : undefined,
        productId: productId !== "all" ? productId : undefined,
        status: status !== "all" ? status : undefined,
        amount: amount.trim() !== "" ? amount : undefined,
        page: 1,
        limit: 10000, // Large limit to get all data
      });

      if (!exportData || !exportData.transactions || exportData.transactions.length === 0) {
        alert("No data to export");
        return;
      }

      // Transform data for CSV export
      const csvData = exportData.transactions.map((tx: any) => ({
        Date: tx.created_at ? formatDateTime(tx.created_at) : "N/A",
        "Merchant Name": tx.vas_merchants?.business_name || "N/A",
        "Merchant Code": tx.vas_merchants?.merchant_code || "N/A",
        "Product Name": tx.vas_products?.product_name || "N/A",
        "Product Code": tx.vas_products?.product_code || "N/A",
        "Beneficiary Account": tx.beneficiary_account || "N/A",
        Amount: tx.amount || "0",
        "Discount Amount": tx.discount_amount || "0",
        "Balance Before": tx.balance_before || "0",
        "Balance After": tx.balance_after || "0",
        Status: tx.status || "N/A",
        "Merchant Reference": tx.merchant_ref || "N/A",
        "Provider Reference": tx.provider_ref || "N/A",
        Description: tx.description || "N/A",
        "Is Reversed": tx.is_reverse ? "Yes" : "No",
        "Reversed At": tx.reversed_at ? formatDateTime(tx.reversed_at) : "N/A",
      }));

      exportToCsv(csvData, "transaction_report");
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
            <h2 className="text-3xl font-bold tracking-tight">Transaction Report</h2>
            <p className="text-muted-foreground">
              View and analyze transaction data with filters
            </p>
          </div>
        </div>
        <Button onClick={handleExport} disabled={isExporting}>
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
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
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
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Amount</label>
              <Input
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                step="0.01"
                min="0"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      {data && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.summary.totalCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Amount</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(data.summary.totalAmount)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Pages</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.totalPages}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative rounded-md border">
            <TableOverlayLoader isVisible={isLoading} />
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Merchant</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Beneficiary</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reference</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-[60px]" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                    </TableRow>
                  ))
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-destructive py-8">
                      Error loading transactions
                    </TableCell>
                  </TableRow>
                ) : data?.transactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      No transactions found
                    </TableCell>
                  </TableRow>
                ) : (
                  data?.transactions.map((tx: any) => (
                    <TableRow key={tx.id}>
                      <TableCell className="text-sm">{formatDateTime(tx.created_at)}</TableCell>
                      <TableCell>
                        <div className="text-sm font-medium">{tx.vas_merchants?.business_name}</div>
                        <div className="text-xs text-muted-foreground">{tx.vas_merchants?.merchant_code}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{tx.vas_products?.product_name}</div>
                        <div className="text-xs text-muted-foreground">{tx.vas_products?.product_code}</div>
                      </TableCell>
                      <TableCell className="text-sm font-mono">{tx.beneficiary_account}</TableCell>
                      <TableCell className="text-sm font-medium">{formatCurrency(tx.amount)}</TableCell>
                      <TableCell>{getStatusBadge(tx.status)}</TableCell>
                      <TableCell className="text-sm font-mono">{tx.merchant_ref}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {data && data.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Page {page} of {data.totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                  disabled={page >= data.totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

