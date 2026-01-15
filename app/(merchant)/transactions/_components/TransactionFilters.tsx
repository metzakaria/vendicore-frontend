"use client";

import { useState } from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarIcon, Download, Filter, ChevronDown, ChevronUp, Loader2, X } from "lucide-react";
import { format } from "date-fns";

interface TransactionFiltersProps {
  startDate: Date | undefined;
  endDate: Date | undefined;
  referenceNo: string;
  beneficiary: string;
  amount: string;
  status: string;
  productId: string;
  categoryId: string;
  products: Array<{ id: string; product_name: string }> | undefined;
  categories: Array<{ id: string; name: string }> | undefined;
  onStartDateChange: (date: Date | undefined) => void;
  onEndDateChange: (date: Date | undefined) => void;
  onReferenceNoChange: (value: string) => void;
  onBeneficiaryChange: (value: string) => void;
  onAmountChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onProductIdChange: (value: string) => void;
  onCategoryIdChange: (value: string) => void;
  onSearch: () => void;
  onReset: () => void;
  onExport: () => void;
  isExporting?: boolean;
}

export const TransactionFilters = ({
  startDate,
  endDate,
  referenceNo,
  beneficiary,
  amount,
  status,
  productId,
  categoryId,
  products,
  categories,
  onStartDateChange,
  onEndDateChange,
  onReferenceNoChange,
  onBeneficiaryChange,
  onAmountChange,
  onStatusChange,
  onProductIdChange,
  onCategoryIdChange,
  onSearch,
  onReset,
  onExport,
  isExporting = false,
}: TransactionFiltersProps) => {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <Card>
      <CardHeader 
        className="cursor-pointer select-none p-4 sm:p-6"
        onClick={() => setShowFilters(!showFilters)}
      >
        <CardTitle className="flex items-center justify-between text-lg sm:text-xl">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            <span className="hidden sm:inline">Filters</span>
            <span className="sm:hidden">Filter Transactions</span>
          </div>
          {showFilters ? (
            <ChevronUp className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          )}
        </CardTitle>
      </CardHeader>
      {showFilters && (
      <CardContent className="p-4 sm:p-6">
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal text-sm">
                <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                <span className="truncate">
                  {startDate ? format(startDate, "PP") : "Start Date"}
                </span>
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
                    onStartDateChange(startOfDay);
                  } else {
                    onStartDateChange(undefined);
                  }
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal text-sm">
                <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                <span className="truncate">
                  {endDate ? format(endDate, "PP") : "End Date"}
                </span>
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
                    onEndDateChange(endOfDay);
                  } else {
                    onEndDateChange(undefined);
                  }
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Input
            placeholder="Reference No"
            value={referenceNo}
            onChange={(e) => onReferenceNoChange(e.target.value)}
            className="text-sm"
          />
          <Input
            placeholder="Beneficiary"
            value={beneficiary}
            onChange={(e) => onBeneficiaryChange(e.target.value)}
            className="text-sm"
          />
          <Select value={productId} onValueChange={onProductIdChange} disabled={!products}>
            <SelectTrigger className="text-sm">
              <SelectValue placeholder={products ? "Product" : "Loading..."} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Products</SelectItem>
              {products && products.length > 0 ? (
                products.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.product_name}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-products" disabled>
                  No products available
                </SelectItem>
              )}
            </SelectContent>
          </Select>
          <Select value={categoryId} onValueChange={onCategoryIdChange} disabled={!categories}>
            <SelectTrigger className="text-sm">
              <SelectValue placeholder={categories ? "Category" : "Loading..."} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories && categories.length > 0 ? (
                categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-categories" disabled>
                  No categories available
                </SelectItem>
              )}
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={onStatusChange}>
            <SelectTrigger className="text-sm">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="success">Success</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
          <Input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => onAmountChange(e.target.value)}
            className="text-sm"
          />
        </div>
        <div className="mt-4 flex flex-col sm:flex-row gap-3 sm:gap-2 sm:justify-end">
          <Button 
            variant="secondary" 
            onClick={onExport} 
            disabled={isExporting}
            className="w-full sm:w-auto order-3 sm:order-1"
          >
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span className="truncate">Exporting...</span>
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4 shrink-0" />
                <span className="truncate">Export CSV</span>
              </>
            )}
          </Button>
          <Button 
            variant="outline"
            onClick={onReset}
            className="w-full sm:w-auto order-2 sm:order-2"
          >
            <X className="mr-2 h-4 w-4 shrink-0" />
            <span className="truncate">Reset Filters</span>
          </Button>
          <Button 
            onClick={onSearch}
            className="w-full sm:w-auto order-1 sm:order-3"
          >
            <Filter className="mr-2 h-4 w-4 shrink-0" />
            <span className="truncate">Search Transactions</span>
          </Button>
        </div>
      </CardContent>
      )}
    </Card>
  );
};