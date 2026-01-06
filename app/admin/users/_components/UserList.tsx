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
import { Search, Plus, Eye, MoreHorizontal, Pencil } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { getUsers } from "../_actions/getUsers";
import { TableOverlayLoader } from "@/components/ui/table-overlay-loader";

interface User {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string | null;
  is_superuser: boolean;
  is_staff: boolean;
  is_active: boolean;
  date_joined: Date;
  last_login: Date | null;
  vas_merchants: {
    id: string;
    merchant_code: string;
    business_name: string;
  } | null;
  _count: {
    vas_merchants: number;
  };
}

interface UsersResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const fetchUsers = async (
  page: number,
  search: string,
  role: string,
  isActive: string
): Promise<UsersResponse> => {
  const result = await getUsers({
    page,
    limit: 10,
    search,
    role: role !== "all" ? (role as "admin" | "superadmin" | "merchant") : "all",
    is_active: isActive !== "all" ? isActive === "true" : undefined,
  });

  console.log("fetchUsers result:", result);

  return {
    users: result.users as User[],
    total: result.total,
    page: result.page,
    limit: result.limit,
    totalPages: result.totalPages,
  };
};

export const UserList = () => {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [role, setRole] = useState("all");
  const [isActive, setIsActive] = useState("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initialSearch = params.get("search") || "";
    setSearch(initialSearch);
    setDebouncedSearch(initialSearch);
    setRole(params.get("role") || "all");
    setIsActive(params.get("is_active") || "all");
    setPage(Number(params.get("page")) || 1);
  }, []);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  // Update URL when filters change
  useEffect(() => {
    if (debouncedSearch === "" && role === "all" && isActive === "all" && page === 1) {
      return;
    }

    const params = new URLSearchParams();
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (role !== "all") params.set("role", role);
    if (isActive !== "all") params.set("is_active", isActive);
    if (page > 1) params.set("page", page.toString());

    const newUrl = `/admin/users${params.toString() ? `?${params.toString()}` : ""}`;
    if (window.location.pathname + window.location.search !== newUrl) {
      window.history.replaceState({}, "", newUrl);
    }
  }, [debouncedSearch, role, isActive, page]);

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ["users", page, debouncedSearch, role, isActive],
    queryFn: () => fetchUsers(page, debouncedSearch, role, isActive),
    retry: 1,
    keepPreviousData: true,
    staleTime: 30000,
  });

  console.log("UserList query state:", { 
    isLoading, 
    isFetching, 
    error, 
    data, 
    usersCount: data?.users?.length 
  });

  const handleSearch = (value: string) => {
    setSearch(value);
  };

  const handleRoleChange = (value: string) => {
    setRole(value);
    setPage(1);
  };

  const handleStatusChange = (value: string) => {
    setIsActive(value);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const formatDateTime = (date: Date | string | null) => {
    if (!date) return "Never";
    return new Date(date).toLocaleString("en-NG", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getUserRole = (user: User) => {
    if (user.is_superuser) return "Superadmin";
    if (user.vas_merchants) return "Merchant";
    if (user.is_staff) return "Admin";
    return "User";
  };

  const users = data?.users || [];
  const totalPages = data?.totalPages || 1;
  const currentPage = data?.page || page;

  // Debug log
  if (data && users.length === 0) {
    console.warn("Data received but no users:", data);
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Users</h2>
          <p className="text-muted-foreground">
            Manage system users and their access
          </p>
        </div>
        <Button onClick={() => router.push("/admin/users/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={role} onValueChange={handleRoleChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="superadmin">Superadmin</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="merchant">Merchant</SelectItem>
          </SelectContent>
        </Select>
        <Select value={isActive} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="true">Active</SelectItem>
            <SelectItem value="false">Inactive</SelectItem>
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
      <div className="relative rounded-md border">
        <TableOverlayLoader
          isVisible={isLoading || isFetching}
          label={isLoading ? "Loading users..." : "Updating users..."}
        />
        <div className="w-full overflow-x-auto">
          <Table className="min-w-[880px] text-xs sm:text-sm">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">User</TableHead>
                <TableHead className="w-[180px]">Email</TableHead>
                <TableHead className="w-[120px]">Phone</TableHead>
                <TableHead className="w-[120px]">Role</TableHead>
                <TableHead className="w-[150px]">Merchant</TableHead>
                <TableHead className="w-[100px]">Status</TableHead>
                <TableHead className="w-[140px]">Last Login</TableHead>
                <TableHead className="w-[80px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-4 w-[150px]" />
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
                      <Skeleton className="h-4 w-[120px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[60px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[120px]" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-4 w-[60px]" />
                    </TableCell>
                  </TableRow>
                ))
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-destructive py-8">
                    <div>
                      <p>Error loading users. Please try again.</p>
                      <p className="text-xs mt-2">{error instanceof Error ? error.message : String(error)}</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                    No users found.
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id} className="hover:bg-muted/50">
                    <TableCell className="py-3">
                      <div>
                        <div className="font-medium text-sm">
                          {user.first_name || user.last_name
                            ? `${user.first_name || ""} ${user.last_name || ""}`.trim()
                            : user.username}
                        </div>
                        <div className="text-xs text-muted-foreground font-mono">
                          @{user.username}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="text-sm truncate" title={user.email}>
                        {user.email}
                      </div>
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="text-sm">
                        {user.phone_number || "N/A"}
                      </div>
                    </TableCell>
                    <TableCell className="py-3">
                      <Badge
                        variant={
                          user.is_superuser
                            ? "default"
                            : user.vas_merchants
                            ? "secondary"
                            : "outline"
                        }
                        className="text-xs"
                      >
                        {getUserRole(user)}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3">
                      {user.vas_merchants ? (
                        <div>
                          <div className="text-sm font-medium truncate" title={user.vas_merchants.business_name}>
                            {user.vas_merchants.business_name}
                          </div>
                          <div className="text-xs text-muted-foreground font-mono">
                            {user.vas_merchants.merchant_code}
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">N/A</span>
                      )}
                    </TableCell>
                    <TableCell className="py-3">
                      <Badge variant={user.is_active ? "default" : "secondary"}>
                        {user.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="text-xs text-muted-foreground">
                        {formatDateTime(user.last_login)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right py-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => router.push(`/admin/users/${user.id}`)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => router.push(`/admin/users/${user.id}/edit`)}
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
            Showing page {currentPage} of {totalPages} ({data?.total || 0} total users)
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

