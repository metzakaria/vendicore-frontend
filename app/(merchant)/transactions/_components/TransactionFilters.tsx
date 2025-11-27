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
import { CalendarIcon, Download, Filter, ChevronDown, ChevronUp } from "lucide-react";
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
  onExport: () => void;
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
  onExport,
}: TransactionFiltersProps) => {
  const [showFilters, setShowFilters] = useState(true);

  return (
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
          />
          <Input
            placeholder="Beneficiary"
            value={beneficiary}
            onChange={(e) => onBeneficiaryChange(e.target.value)}
          />
          <Select value={productId} onValueChange={onProductIdChange} disabled={!products}>
            <SelectTrigger>
              <SelectValue placeholder={products ? "Product" : "Loading products..."} />
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
            <SelectTrigger>
              <SelectValue placeholder={categories ? "Category" : "Loading categories..."} />
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
          <Input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => onAmountChange(e.target.value)}
          />
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" onClick={onExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button onClick={onSearch}>
            <Filter className="mr-2 h-4 w-4" />
            Search
          </Button>
        </div>
      </CardContent>
      )}
    </Card>
  );
};

