"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getMerchantTransactions } from "../_actions/getMerchantTransactions";
import { getProductsForDropdown } from "../_actions/getProductsForDropdown";
import { getCategoriesForDropdown } from "../_actions/getCategoriesForDropdown";
import { TransactionFilters } from "./TransactionFilters";
import { TransactionStats } from "./TransactionStats";
import { TransactionTable } from "./TransactionTable";
import { exportToCsv } from "@/lib/utils/exportToCsv";
import { format } from "date-fns";

// Define the interface for a single transaction item based on the serialized output for export
interface ExportTransactionItem {
  id: string;
  merchant_id: string;
  product_id: string;
  provider_account_id: string | null;
  amount: string;
  discount_amount: string;
  balance_before: string;
  balance_after: string;
  merchant_ref: string;
  provider_ref: string | null;
  beneficiary_account: string;
  status: string;
  is_reverse: boolean;
  reversed_at: string | Date | null;
  created_at: string | Date;
  updated_at: string | Date | null;
  vas_products: {
    product_name: string;
    product_code: string;
  } | null;
  vas_provider_accounts: {
    account_name: string;
  } | null;
  // Add other properties from vas_transactions model if they are used in the export
}

const fetchTransactions = async (
  page: number,
  referenceNo: string,
  beneficiary: string,
  amount: string,
  status: string,
  startDate: string,
  endDate: string,
  productId: string,
  categoryId: string
) => {
  console.log("fetchTransactions called with:", { page, referenceNo, beneficiary, amount, status, startDate, endDate, productId, categoryId });
  const result = await getMerchantTransactions({
    page,
    limit: 20,
    referenceNo: referenceNo || undefined,
    beneficiary: beneficiary || undefined,
    amount: amount || undefined,
    status: status !== "all" ? (status as "success" | "failed" | "pending") : undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    productId: productId !== "all" ? productId : undefined,
    categoryId: categoryId !== "all" ? categoryId : undefined,
  });

  console.log("fetchTransactions result:", result);

  return {
    transactions: result.transactions || [],
    total: result.total || 0,
    page: result.page || page,
    limit: result.limit || 20,
    totalPages: result.totalPages || 0,
    stats: result.stats || {
      transactionCount: 0,
      transactionValue: "0",
      transactionSuccess: "0",
      transactionFail: "0",
    },
  };
};

export const MerchantTransactionList = () => {
  // Set today as default for dates - moved inside useState initializer
  const todayInitializer = () => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  };
  const todayEndInitializer = () => {
    const d = new Date();
    d.setHours(23, 59, 59, 999);
    return d;
  };
  
  const [referenceNo, setReferenceNo] = useState(() => new URLSearchParams(window.location.search).get("referenceNo") || "");
  const [beneficiary, setBeneficiary] = useState(() => new URLSearchParams(window.location.search).get("beneficiary") || "");
  const [amount, setAmount] = useState(() => new URLSearchParams(window.location.search).get("amount") || "");
  const [status, setStatus] = useState(() => new URLSearchParams(window.location.search).get("status") || "all");
  const [startDate, setStartDate] = useState<Date | undefined>(() => {
    const urlStartDate = new URLSearchParams(window.location.search).get("startDate");
    return urlStartDate ? new Date(urlStartDate) : todayInitializer();
  });
  const [endDate, setEndDate] = useState<Date | undefined>(() => {
    const urlEndDate = new URLSearchParams(window.location.search).get("endDate");
    if (urlEndDate) {
      const end = new Date(urlEndDate);
      end.setHours(23, 59, 59, 999);
      return end;
    }
    return todayEndInitializer();
  });
  const [productId, setProductId] = useState(() => new URLSearchParams(window.location.search).get("product") || "all");
  const [categoryId, setCategoryId] = useState(() => new URLSearchParams(window.location.search).get("category") || "all");
  const [page, setPage] = useState(() => Number(new URLSearchParams(window.location.search).get("page")) || 1);
  
  // Active filter values (applied when button is clicked)
  const [activeReferenceNo, setActiveReferenceNo] = useState(referenceNo);
  const [activeBeneficiary, setActiveBeneficiary] = useState(beneficiary);
  const [activeAmount, setActiveAmount] = useState(amount);
  const [activeStatus, setActiveStatus] = useState(status);
  const [activeStartDate, setActiveStartDate] = useState<Date | undefined>(startDate);
  const [activeEndDate, setActiveEndDate] = useState<Date | undefined>(endDate);
  const [activeProductId, setActiveProductId] = useState(productId);
  const [activeCategoryId, setActiveCategoryId] = useState(categoryId);
  const [isExporting, setIsExporting] = useState(false);

  // Fetch products and categories for dropdown
  const { data: products } = useQuery({
    queryKey: ["merchant-products-dropdown"],
    queryFn: () => getProductsForDropdown(),
    staleTime: 300000,
  });

  const { data: categories } = useQuery({
    queryKey: ["merchant-categories-dropdown"],
    queryFn: () => getCategoriesForDropdown(),
    staleTime: 300000,
  });

  // Removed problematic useEffect for initializing from URL params
  // useEffect(() => { ... }, []);

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: [
      "merchant-transactions",
      page,
      activeReferenceNo,
      activeBeneficiary,
      activeAmount,
      activeStatus,
      activeStartDate?.toISOString() || null,
      activeEndDate?.toISOString() || null,
      activeProductId,
      activeCategoryId,
    ],
    queryFn: () =>
      fetchTransactions(
        page,
        activeReferenceNo,
        activeBeneficiary,
        activeAmount,
        activeStatus,
        activeStartDate ? activeStartDate.toISOString() : "",
        activeEndDate ? activeEndDate.toISOString() : "",
        activeProductId,
        activeCategoryId
      ),
    retry: 1,
    staleTime: 30000,
  });

  console.log("MerchantTransactionList query state:", {
    isLoading,
    isFetching,
    error,
    data,
    transactionsCount: data?.transactions?.length,
  });

  const formatDateTime = (date: string | Date | null) => {
    if (!date) return "N/A";
    return format(new Date(date), "MMM dd, yyyy HH:mm");
  };

  const handleExport = async () => {
    if (isExporting) return;
    
    setIsExporting(true);
    try {
      // Fetch all transactions with current filters (no pagination)
      const exportResult = await getMerchantTransactions({
        page: 1,
        limit: 10000, // Large limit to get all data
        referenceNo: activeReferenceNo || undefined,
        beneficiary: activeBeneficiary || undefined,
        amount: activeAmount || undefined,
        status: activeStatus !== "all" ? (activeStatus as "success" | "failed" | "pending") : undefined,
        startDate: activeStartDate ? activeStartDate.toISOString() : undefined,
        endDate: activeEndDate ? activeEndDate.toISOString() : undefined,
        productId: activeProductId !== "all" ? activeProductId : undefined,
        categoryId: activeCategoryId !== "all" ? activeCategoryId : undefined,
      });

      if (!exportResult || !exportResult.transactions || exportResult.transactions.length === 0) {
        alert("No data to export");
        return;
      }

      // Transform data for CSV export
      const csvData = exportResult.transactions.map((tx: ExportTransactionItem) => ({
        Date: formatDateTime(tx.created_at),
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

      exportToCsv(csvData, "merchant_transactions");
    } catch (error) {
      console.error("Export error:", error);
      alert("Failed to export data. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleSearch = () => {
    // Apply filters when button is clicked
    setActiveReferenceNo(referenceNo);
    setActiveBeneficiary(beneficiary);
    setActiveAmount(amount);
    setActiveStatus(status);
    setActiveStartDate(startDate);
    setActiveEndDate(endDate);
    setActiveProductId(productId);
    setActiveCategoryId(categoryId);
    setPage(1);
    
    // Update URL
    const params = new URLSearchParams();
    if (referenceNo) params.set("referenceNo", referenceNo);
    if (beneficiary) params.set("beneficiary", beneficiary);
    if (amount) params.set("amount", amount);
    if (status !== "all") params.set("status", status);
    if (productId !== "all") params.set("product", productId);
    if (categoryId !== "all") params.set("category", categoryId);
    if (startDate) params.set("startDate", startDate.toISOString());
    if (endDate) params.set("endDate", endDate.toISOString());

    const newUrl = `/transactions${params.toString() ? `?${params.toString()}` : ""}`;
    window.history.replaceState({}, "", newUrl);
  };

  const transactions = data?.transactions || [];
  const totalPages = data?.totalPages || 1;
  const currentPage = data?.page || page;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Transactions</h2>
        <p className="text-muted-foreground">
          View and manage your transaction history
        </p>
      </div>

      {/* Filters */}
      <TransactionFilters
        startDate={startDate}
        endDate={endDate}
        referenceNo={referenceNo}
        beneficiary={beneficiary}
        amount={amount}
        status={status}
        productId={productId}
        categoryId={categoryId}
        products={products}
        categories={categories}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        onReferenceNoChange={setReferenceNo}
        onBeneficiaryChange={setBeneficiary}
        onAmountChange={setAmount}
        onStatusChange={setStatus}
        onProductIdChange={setProductId}
        onCategoryIdChange={setCategoryId}
        onSearch={handleSearch}
        onExport={handleExport}
        isExporting={isExporting}
      />

      {/* Stats Cards */}
      <TransactionStats
        isLoading={isLoading}
        transactionCount={data?.stats?.transactionCount || 0}
        transactionValue={data?.stats?.transactionValue || "0"}
        transactionSuccess={data?.stats?.transactionSuccess || "0"}
        transactionFail={data?.stats?.transactionFail || "0"}
      />

      {/* Progress bar for background fetching */}
      {isFetching && !isLoading && (
        <div className="h-1 w-full overflow-hidden rounded-full bg-secondary">
          <div className="h-full w-full animate-pulse bg-primary/20" />
        </div>
      )}

      {/* Table */}
      <TransactionTable
        transactions={transactions}
        isLoading={isLoading}
        isFetching={isFetching}
        error={error}
        currentPage={currentPage}
        totalPages={totalPages}
        total={data?.total || 0}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

