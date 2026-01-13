"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getMerchantLoginRecords } from "../_actions/getMerchantLoginRecords";

interface MerchantLoginRecordsProps {
  merchantId: string;
}

export const MerchantLoginRecords = ({ merchantId }: MerchantLoginRecordsProps) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["merchant-login-records", merchantId],
    queryFn: () => getMerchantLoginRecords(merchantId),
    staleTime: 60000, // 1 minute
  });

  const formatActionFlag = (flag: number) => {
    switch (flag) {
      case 1:
        return "Addition";
      case 2:
        return "Change";
      case 3:
        return "Deletion";
      default:
        return "Log in";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Activity Log</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Details</TableHead>
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
                      <Skeleton className="h-4 w-[100px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[250px]" />
                    </TableCell>
                  </TableRow>
                ))
              ) : error ? (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-center text-destructive py-8"
                  >
                    Error loading user activity log.
                  </TableCell>
                </TableRow>
              ) : data?.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-center text-muted-foreground py-8"
                  >
                    No user activity found.
                  </TableCell>
                </TableRow>
              ) : (
                data?.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      {new Date(record.action_time).toLocaleString()}
                    </TableCell>
                    <TableCell>{formatActionFlag(record.action_flag)}</TableCell>
                    <TableCell>{record.object_repr}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
