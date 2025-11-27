"use client";

import { useState } from "react";
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
import { ArrowLeft, CalendarIcon, Download } from "lucide-react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { getMerchantReport } from "../../_actions/getMerchantReport";
import { getMerchantsForDropdown } from "@/app/admin/funding/_actions/getMerchantsForDropdown";

export const MerchantReport = () => {
  const router = useRouter();
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [merchantId, setMerchantId] = useState<string>("all");

  const { data: merchants } = useQuery({
    queryKey: ["merchants-dropdown"],
    queryFn: () => getMerchantsForDropdown(),
    staleTime: 300000,
  });

  const { data, isLoading, error } = useQuery({
    queryKey: [
      "merchant-report",
      startDate?.toISOString(),
      endDate?.toISOString(),
      merchantId,
    ],
    queryFn: () =>
      getMerchantReport({
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString(),
        merchantId: merchantId !== "all" ? merchantId : undefined,
      }),
    staleTime: 30000,
  });

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
    }).format(Number(amount));
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
            <h2 className="text-3xl font-bold tracking-tight">Merchant Performance Report</h2>
            <p className="text-muted-foreground">
              Analyze merchant activity and performance metrics
            </p>
          </div>
        </div>
        <Button onClick={() => alert("Export coming soon!")}>
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
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
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      {data && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Total Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.totals.totalTransactions}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Total Amount</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(data.totals.totalAmount)}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Merchant Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Merchant Code</TableHead>
                  <TableHead>Business Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Transactions</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Current Balance</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-[60px]" /></TableCell>
                    </TableRow>
                  ))
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-destructive py-8">
                      Error loading merchant report
                    </TableCell>
                  </TableRow>
                ) : data?.merchants.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      No merchant data found
                    </TableCell>
                  </TableRow>
                ) : (
                  data?.merchants.map((merchant: any) => (
                    <TableRow key={merchant.merchant_id}>
                      <TableCell className="font-mono text-sm">{merchant.merchant_code}</TableCell>
                      <TableCell className="font-medium">{merchant.business_name}</TableCell>
                      <TableCell className="text-sm">{merchant.email}</TableCell>
                      <TableCell className="text-sm">{merchant.total_transactions}</TableCell>
                      <TableCell className="text-sm font-medium">
                        {formatCurrency(merchant.total_amount)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatCurrency(merchant.current_balance)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={merchant.is_active ? "default" : "secondary"}>
                          {merchant.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

