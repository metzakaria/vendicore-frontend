"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getMerchantTransactions } from "../_actions/getMerchantTransactions";
import { getProductsForDropdown } from "../_actions/getProductsForDropdown";
import { getCategoriesForDropdown } from "../_actions/getCategoriesForDropdown";
import { TransactionFilters } from "./TransactionFilters";
import { TransactionStats } from "./TransactionStats";
import { TransactionTable } from "./TransactionTable";

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
  // Set today as default for dates
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);
  
  const [referenceNo, setReferenceNo] = useState("");
  const [beneficiary, setBeneficiary] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("all");
  const [startDate, setStartDate] = useState<Date | undefined>(today);
  const [endDate, setEndDate] = useState<Date | undefined>(todayEnd);
  const [productId, setProductId] = useState("all");
  const [categoryId, setCategoryId] = useState("all");
  const [page, setPage] = useState(1);
  
  // Active filter values (applied when button is clicked)
  const [activeReferenceNo, setActiveReferenceNo] = useState("");
  const [activeBeneficiary, setActiveBeneficiary] = useState("");
  const [activeAmount, setActiveAmount] = useState("");
  const [activeStatus, setActiveStatus] = useState("all");
  const [activeStartDate, setActiveStartDate] = useState<Date | undefined>(today);
  const [activeEndDate, setActiveEndDate] = useState<Date | undefined>(todayEnd);
  const [activeProductId, setActiveProductId] = useState("all");
  const [activeCategoryId, setActiveCategoryId] = useState("all");

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

  // Initialize from URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initialReferenceNo = params.get("referenceNo") || "";
    setReferenceNo(initialReferenceNo);
    setActiveReferenceNo(initialReferenceNo);
    
    const initialBeneficiary = params.get("beneficiary") || "";
    setBeneficiary(initialBeneficiary);
    setActiveBeneficiary(initialBeneficiary);
    
    const initialAmount = params.get("amount") || "";
    setAmount(initialAmount);
    setActiveAmount(initialAmount);
    
    const initialStatus = params.get("status") || "all";
    setStatus(initialStatus);
    setActiveStatus(initialStatus);
    
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

  const handleExport = () => {
    alert("Export functionality coming soon!");
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

