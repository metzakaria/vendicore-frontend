"use client";

import { ArrowLeft, Package, Calendar, Hash, Pencil, Tag } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface DataPackageDetailsProps {
  dataPackage: any;
}

export const DataPackageDetails = ({ dataPackage }: DataPackageDetailsProps) => {
  const router = useRouter();

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/admin/data-packages")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">{dataPackage.data_code}</h2>
            <p className="text-muted-foreground">
              Product: {dataPackage.vas_products.product_name}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={dataPackage.is_active ? "default" : "secondary"} className="text-base px-3 py-1">
            {dataPackage.is_active ? "Active" : "Inactive"}
          </Badge>
          <Button
            variant="outline"
            onClick={() => router.push(`/admin/data-packages/${dataPackage.id}/edit`)}
          >
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Package Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Package Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Data Code</span>
                <Badge variant="outline" className="font-mono">
                  {dataPackage.data_code}
                </Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Tariff ID</span>
                <span className="text-sm">{dataPackage.tariff_id || "N/A"}</span>
              </div>
              <Separator />
              <div className="flex items-start justify-between">
                <span className="text-sm font-medium text-muted-foreground">Description</span>
                <span className="text-sm text-right max-w-[60%]">{dataPackage.description}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Product</span>
                <div className="text-right">
                  <div className="text-sm font-medium">{dataPackage.vas_products.product_name}</div>
                  <div className="text-xs text-muted-foreground">
                    {dataPackage.vas_products.product_code}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Package Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Package Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Amount</span>
                <Badge variant="outline" className="font-mono">
                  {formatCurrency(dataPackage.amount)}
                </Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Value</span>
                <span className="text-sm font-medium">{dataPackage.value}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Duration</span>
                <span className="text-sm font-medium">{dataPackage.duration}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timestamps */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Timestamps
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Created At</span>
                <span className="text-sm">{formatDateTime(dataPackage.created_at)}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Last Updated</span>
                <span className="text-sm">{formatDateTime(dataPackage.updated_at)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

