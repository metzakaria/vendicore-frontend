"use client";

import { ArrowLeft, Package, Server, Calendar, Hash, Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface ProductDetailsProps {
  product: any;
}

export const ProductDetails = ({ product }: ProductDetailsProps) => {
  const router = useRouter();

  const formatDate = (date: Date | string | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-NG", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
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
            onClick={() => router.push("/admin/products")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">{product.product_name}</h2>
            <p className="text-muted-foreground">
              Code: {product.product_code}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={product.is_active ? "default" : "secondary"} className="text-base px-3 py-1">
            {product.is_active ? "Active" : "Inactive"}
          </Badge>
          <Button
            variant="outline"
            onClick={() => router.push(`/admin/products/${product.id}/edit`)}
          >
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Product Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Product Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Product Name</span>
                <span className="text-sm font-medium">{product.product_name}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Product Code</span>
                <Badge variant="outline" className="font-mono">
                  {product.product_code}
                </Badge>
              </div>
              <Separator />
              <div className="flex items-start justify-between">
                <span className="text-sm font-medium text-muted-foreground">Description</span>
                <span className="text-sm text-right max-w-[60%]">{product.description}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Category</span>
                <div className="text-right">
                  <div className="text-sm font-medium">{product.vas_product_categories.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {product.vas_product_categories.category_code}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Provider Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              Provider Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Preferred Provider</span>
                {product.preferred_provider_account ? (
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {product.preferred_provider_account.account_name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {product.preferred_provider_account.vas_providers.provider_code}
                    </div>
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">Not set</span>
                )}
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Backup Provider</span>
                {product.backup_provider_account ? (
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {product.backup_provider_account.account_name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {product.backup_provider_account.vas_providers.provider_code}
                    </div>
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">Not set</span>
                )}
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
                <span className="text-sm">{formatDateTime(product.created_at)}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Last Updated</span>
                <span className="text-sm">{formatDateTime(product.updated_at)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

