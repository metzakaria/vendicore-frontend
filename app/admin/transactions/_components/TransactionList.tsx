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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, CalendarIcon, Filter, ChevronDown, ChevronUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { getTransactions } from "../_actions/getTransactions";
import { getMerchantsForDropdown } from "../_actions/getMerchantsForDropdown";
import { getProductsForDropdown } from "../_actions/getProductsForDropdown";
import { getCategoriesForDropdown } from "../_actions/getCategoriesForDropdown";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";

interface Transaction {
  id: string;
  merchant_ref: string;
  provider_ref: string | null;
  beneficiary_account: string;
  amount: string;
  discount_amount: string;
  balance_before: string;
  balance_after: string;
  status: string;
  description: string;
  is_reverse: boolean;
  reversed_at: Date | null;
  created_at: Date | null;
  vas_merchants: {
    id: string;
    merchant_code: string;
    business_name: string;
  };
  vas_products: {
    id: string;
    product_name: string;
    product_code: string;
  };
  vas_provider_accounts: {
    id: string;
    account_name: string;
    vas_providers: {
      name: string;
      provider_code: string;
    };
  } | null;
}

interface TransactionsResponse {
  transactions: Transaction[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const fetchTransactions = async (
  page: number,
  referenceNo: string,
  beneficiary: string,
  status: string,
  merchantId: string,
  productId: string,
  categoryId: string,
  startDate: string,
  endDate: string
): Promise<TransactionsResponse> => {
  const result = await getTransactions({
    page,
    limit: 20,
    referenceNo: referenceNo || undefined,
    beneficiary: beneficiary || undefined,
    status: status !== "all" ? status : undefined,
    merchant_id: merchantId && merchantId !== "all" ? merchantId : undefined,
    product_id: productId && productId !== "all" ? productId : undefined,
    category_id: categoryId && categoryId !== "all" ? categoryId : undefined,
    date_from: startDate || undefined,
    date_to: endDate || undefined,
  });

  return {
    transactions: result.transactions as Transaction[],
    total: result.total,
    page: result.page,
    limit: result.limit,
    totalPages: result.totalPages,
  };
};

export const TransactionList = () => {
  const router = useRouter();
  
  // Set today as default for dates
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);
  
  // UI state
  const [showFilters, setShowFilters] = useState(true);
  
  // Filter state
  const [referenceNo, setReferenceNo] = useState("");
  const [beneficiary, setBeneficiary] = useState("");
  const [status, setStatus] = useState("all");
  const [merchantId, setMerchantId] = useState("all");
  const [productId, setProductId] = useState("all");
  const [categoryId, setCategoryId] = useState("all");
  const [startDate, setStartDate] = useState<Date | undefined>(today);
  const [endDate, setEndDate] = useState<Date | undefined>(todayEnd);
  const [page, setPage] = useState(1);
  
  // Active filter values (applied when Search button is clicked)
  const [activeReferenceNo, setActiveReferenceNo] = useState("");
  const [activeBeneficiary, setActiveBeneficiary] = useState("");
  const [activeStatus, setActiveStatus] = useState("all");
  const [activeMerchantId, setActiveMerchantId] = useState("all");
  const [activeProductId, setActiveProductId] = useState("all");
  const [activeCategoryId, setActiveCategoryId] = useState("all");
  const [activeStartDate, setActiveStartDate] = useState<Date | undefined>(today);
  const [activeEndDate, setActiveEndDate] = useState<Date | undefined>(todayEnd);

  // Fetch merchants, products, categories for dropdowns
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

  const { data: categories } = useQuery({
    queryKey: ["categories-dropdown"],
    queryFn: () => getCategoriesForDropdown(),
    staleTime: 300000,
  });

  // Initialize from URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    
    const initialReferenceNo = params.get("referenceNo") || "";
    setReferenceNo(initialReferenceNo);
    setActiveReferenceNo(initialReferenceNo);
    
    const initialBeneficiary = params.get("beneficiary") || "";
    setBeneficiary(initialBeneficiary);
    setActiveBeneficiary(initialBeneficiary);
    
    const initialStatus = params.get("status") || "all";
    setStatus(initialStatus);
    setActiveStatus(initialStatus);
    
    const initialMerchantId = params.get("merchant") || "all";
    setMerchantId(initialMerchantId);
    setActiveMerchantId(initialMerchantId);
    
    const initialProductId = params.get("product") || "all";
    setProductId(initialProductId);
    setActiveProductId(initialProductId);
    
    const initialCategoryId = params.get("category") || "all";
    setCategoryId(initialCategoryId);
    setActiveCategoryId(initialCategoryId);
    
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
      "admin-transactions",
      page,
      activeReferenceNo,
      activeBeneficiary,
      activeStatus,
      activeMerchantId,
      activeProductId,
      activeCategoryId,
      activeStartDate?.toISOString() || null,
      activeEndDate?.toISOString() || null,
    ],
    queryFn: () =>
      fetchTransactions(
        page,
        activeReferenceNo,
        activeBeneficiary,
        activeStatus,
        activeMerchantId,
        activeProductId,
        activeCategoryId,
        activeStartDate ? activeStartDate.toISOString() : "",
        activeEndDate ? activeEndDate.toISOString() : ""
      ),
    retry: 1,
    staleTime: 30000,
  });

  const handleSearch = () => {
    // Apply filters when Search button is clicked
    setActiveReferenceNo(referenceNo);
    setActiveBeneficiary(beneficiary);
    setActiveStatus(status);
    setActiveMerchantId(merchantId);
    setActiveProductId(productId);
    setActiveCategoryId(categoryId);
    setActiveStartDate(startDate);
    setActiveEndDate(endDate);
    setPage(1);
    
    // Update URL
    const params = new URLSearchParams();
    if (referenceNo) params.set("referenceNo", referenceNo);
    if (beneficiary) params.set("beneficiary", beneficiary);
    if (status !== "all") params.set("status", status);
    if (merchantId !== "all") params.set("merchant", merchantId);
    if (productId !== "all") params.set("product", productId);
    if (categoryId !== "all") params.set("category", categoryId);
    if (startDate) params.set("startDate", startDate.toISOString());
    if (endDate) params.set("endDate", endDate.toISOString());

    const newUrl = `/admin/transactions${params.toString() ? `?${params.toString()}` : ""}`;
    window.history.replaceState({}, "", newUrl);
  };


  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
    }).format(Number(amount));
  };

  const formatDateTime = (date: Date | string | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleString("en-NG", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string, isReverse: boolean) => {
    if (isReverse) {
      return <Badge variant="secondary">Reversed</Badge>;
    }
    switch (status.toLowerCase()) {
      case "success":
      case "completed":
        return <Badge variant="default">Success</Badge>;
      case "pending":
        return <Badge variant="outline">Pending</Badge>;
      case "failed":
      case "error":
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const transactions = data?.transactions || [];
  const totalPages = data?.totalPages || 1;
  const currentPage = data?.page || page;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Transactions</h2>
          <p className="text-muted-foreground">
            View and manage all transactions
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader 
          className="cursor-pointer select-none"
          onClick={() => setShowFilters(!showFilters)}
        >
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </div>
            {showFilters ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            )}
          </CardTitle>
        </CardHeader>
        {showFilters && (
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
                  onSelect={(date) => {
                    if (date) {
                      const startOfDay = new Date(date);
                      startOfDay.setHours(0, 0, 0, 0);
                      setStartDate(startOfDay);
                    } else {
                      setStartDate(undefined);
                    }
                  }}
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
                  onSelect={(date) => {
                    if (date) {
                      const endOfDay = new Date(date);
                      endOfDay.setHours(23, 59, 59, 999);
                      setEndDate(endOfDay);
                    } else {
                      setEndDate(undefined);
                    }
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <Input
              placeholder="Reference No"
              value={referenceNo}
              onChange={(e) => setReferenceNo(e.target.value)}
            />
            <Input
              placeholder="Beneficiary"
              value={beneficiary}
              onChange={(e) => setBeneficiary(e.target.value)}
            />
            <Select value={merchantId} onValueChange={setMerchantId}>
              <SelectTrigger>
                <SelectValue placeholder="Merchant" />
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
            <Select value={productId} onValueChange={setProductId} disabled={!products}>
              <SelectTrigger>
                <SelectValue placeholder={products ? "Product" : "Loading products..."} />
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
            <Select value={categoryId} onValueChange={setCategoryId} disabled={!categories}>
              <SelectTrigger>
                <SelectValue placeholder={categories ? "Category" : "Loading categories..."} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories?.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="mt-4 flex justify-end">
            <Button onClick={handleSearch}>
              <Filter className="mr-2 h-4 w-4" />
              Search
            </Button>
          </div>
        </CardContent>
        )}
      </Card>

      {/* Progress bar for background fetching */}
      {isFetching && !isLoading && (
        <div className="h-1 w-full overflow-hidden rounded-full bg-secondary">
          <div className="h-full w-full animate-pulse bg-primary/20" />
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[140px]">Date & Time</TableHead>
                <TableHead className="w-[180px]">Merchant</TableHead>
                <TableHead className="w-[160px]">Product</TableHead>
                <TableHead className="w-[200px]">Reference</TableHead>
                <TableHead className="w-[120px]">Amount</TableHead>
                <TableHead className="w-[100px]">Status</TableHead>
                <TableHead className="w-[80px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-4 w-[120px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[150px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[120px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[180px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[100px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[80px]" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-4 w-[60px]" />
                    </TableCell>
                  </TableRow>
                ))
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-destructive py-8">
                    Error loading transactions. Please try again.
                  </TableCell>
                </TableRow>
              ) : transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No transactions found.
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((transaction) => (
                  <TableRow key={transaction.id} className="hover:bg-muted/50">
                    <TableCell className="py-3">
                      <div className="text-xs font-medium">
                        {new Date(transaction.created_at || "").toLocaleDateString("en-NG", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(transaction.created_at || "").toLocaleTimeString("en-NG", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="font-medium text-sm truncate" title={transaction.vas_merchants.business_name}>
                        {transaction.vas_merchants.business_name}
                      </div>
                      <div className="text-xs text-muted-foreground font-mono">
                        {transaction.vas_merchants.merchant_code}
                      </div>
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="font-medium text-sm truncate" title={transaction.vas_products.product_name}>
                        {transaction.vas_products.product_name}
                      </div>
                      <div className="text-xs text-muted-foreground font-mono">
                        {transaction.vas_products.product_code}
                      </div>
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="font-mono text-xs truncate" title={transaction.merchant_ref}>
                        {transaction.merchant_ref}
                      </div>
                      {transaction.provider_ref && (
                        <div className="text-xs text-muted-foreground truncate" title={transaction.provider_ref}>
                          {transaction.provider_ref.length > 25 
                            ? `${transaction.provider_ref.substring(0, 25)}...` 
                            : transaction.provider_ref}
                        </div>
                      )}
                      <div className="text-xs text-muted-foreground mt-1 truncate" title={transaction.beneficiary_account}>
                        To: {transaction.beneficiary_account}
                      </div>
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="font-semibold text-sm">
                        {formatCurrency(transaction.amount)}
                      </div>
                      {Number(transaction.discount_amount) > 0 && (
                        <div className="text-xs text-green-600">
                          -{formatCurrency(transaction.discount_amount)}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="py-3">
                      {getStatusBadge(transaction.status, transaction.is_reverse)}
                    </TableCell>
                    <TableCell className="text-right py-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/admin/transactions/${transaction.id}`)}
                        className="h-8 w-8 p-0"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing page {currentPage} of {totalPages} ({data?.total || 0} total transactions)
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

