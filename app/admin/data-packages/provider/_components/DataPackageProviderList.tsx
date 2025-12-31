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
import { Search, Plus, Eye, MoreHorizontal, Pencil, Upload } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { getDataPackagesWithProviderCode } from "../../_actions/getDataPackages";
import { getProvidersForDropdown } from "@/app/admin/providers/_actions/getProvidersForDropdown";

interface DataPackage {
  id: string;
  data_code: string;
  tariff_id: string | null;
  amount: string;
  description: string;
  duration: string;
  value: string;
  is_active: boolean;
  created_at: Date | null;
  vas_products: {
    id: string;
    product_name: string;
    product_code: string;
  };
}

interface DataPackagesResponse {
  packages: DataPackage[];
  total: number;
}

const fetchDataPackages = async (
  network: string,
  providerId: string
): Promise<DataPackagesResponse> => {
  const result = await getDataPackagesWithProviderCode({
    network: network && network !== "all" ? network : undefined,
    providerId: providerId && providerId !== "all" ? providerId : undefined,
  });

  return {
    packages: result.packages as DataPackage[],
    total: result.total
  };
};

export const DataPackageProviderList = () => {
  const router = useRouter();
  const [network, setNetwork] = useState("MTN");
  const [providerId, setProviderId] = useState("all");

  // Fetch providers for dropdown
  const { data: providers } = useQuery({
    queryKey: ["providers-dropdown"],
    queryFn: () => getProvidersForDropdown(),
    staleTime: 300000, // 5 minutes
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setNetwork(params.get("network") || "all");
    setProviderId(params.get("provider_id") || "all");
  }, []);

  // Debounce search input
 // useEffect(() => {
  //  const timer = setTimeout(() => {
      //setDebouncedSearch(search);
      //setPage(1);
    //}, 500);

    //return () => clearTimeout(timer);
  //}, [search]);

 

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ["dataPackages", network, providerId],
    queryFn: () => getDataPackagesWithProviderCode({ network, providerId }),
    retry: 1,
    keepPreviousData: true,
    staleTime: 30000,
  });

  const handleSearch = (value: string) => {
    //setSearch(value);
  };

  const handleNetworkChange = (value: string) => {
    setNetwork(value);
   // setPage(1);
  };

  const handleProviderChange = (value: string) => {
    setProviderId(value);
    //setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    //setPage(newPage);
  };

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
    }).format(Number(amount));
  };

  const packages = data?.packages || [];
  const totalPages = data?.total || 1;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Provider's Data Packages</h2>
          <p className="text-muted-foreground">
            Manage data packages for providers
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => router.push("/admin/data-packages/import")}
          >
            <Upload className="mr-2 h-4 w-4" />
            Import CSV
          </Button>
          <Button onClick={() => router.push("/admin/data-packages/new")}>
            <Plus className="mr-2 h-4 w-4" />
            Add Package
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 py-5">

        <Select value={providerId} onValueChange={handleProviderChange}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Product" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Select Provider</SelectItem>
            {providers?.map((provider) => (
              <SelectItem key={provider.id} value={provider.id}>
                {provider.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={network} onValueChange={handleNetworkChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Select Network</SelectItem>
            <SelectItem value="AIRTEL">Airtel</SelectItem>
            <SelectItem value="MTN">MTN</SelectItem>
            <SelectItem value="GLO">Glo</SelectItem>
            <SelectItem value="9MOBILE">9Mobile</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Progress bar for background fetching */}
      {isFetching && !isLoading && (
        <div className="h-1 w-full overflow-hidden rounded-full bg-secondary">
          <div className="h-full w-full animate-pulse bg-primary/20" />
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Description</TableHead>
              <TableHead>Network</TableHead>
              <TableHead>Data Code</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Provider Status</TableHead>
              <TableHead className="text-right">Provide Code</TableHead>
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
                    <Skeleton className="h-4 w-[100px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[80px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[80px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[80px]" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="h-4 w-[80px]" />
                  </TableCell>
                </TableRow>
              ))
            ) : error ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-destructive">
                  Error loading data packages. Please try again.
                </TableCell>
              </TableRow>
            ) : packages.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  No data packages found.
                </TableCell>
              </TableRow>
            ) : (
              packages.map((pkg) => (
                <TableRow key={pkg.id}>
                  <TableCell className="font-medium"><div className=" text-wrap">{pkg.description}</div></TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{pkg.vas_products.network}</div>
                      <div className="text-xs text-muted-foreground">
                        {pkg.vas_products.product_code}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{pkg.data_code}</TableCell>
                  <TableCell>{formatCurrency(pkg.amount)}</TableCell>
                  <TableCell>{pkg.value}</TableCell>
                  <TableCell>{pkg.duration}</TableCell>
                  <TableCell >
                    <Select
                      //value={status}
                    //onValueChange={handleStatusChange}
                    >
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Active</SelectItem>
                        <SelectItem value="0">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right">
                    <Input
                      placeholder=" -- None --"
                      //value={search}
                      //onChange={(e) => handleSearch(e.target.value)}
                      className=" w-[120px]"
                      id={pkg.id}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing page  ({data?.total || 0} total packages)
          </div>
          <div className="flex gap-2">
            
          </div>
        </div>
      )}
    </div>
  );
};

