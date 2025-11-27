"use client";

import { useState } from "react";
import { ArrowLeft, Building2, Package, Calendar, Hash, Pencil, Percent, Tag, Trash2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteDiscount } from "../../_actions/deleteDiscount";

interface DiscountDetailsProps {
  discount: any;
}

export const DiscountDetails = ({ discount }: DiscountDetailsProps) => {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const formatDiscount = (type: string, value: string) => {
    if (type === "percentage") {
      return `${value}%`;
    }
    return `₦${Number(value).toLocaleString()}`;
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

  const handleDelete = async () => {
    setIsDeleting(true);
    setDeleteError(null);

    try {
      const result = await deleteDiscount(discount.id);
      if (result.success) {
        router.push("/admin/discounts");
      } else {
        setDeleteError(result.error || "Failed to delete discount");
        setIsDeleting(false);
      }
    } catch (err: any) {
      setDeleteError(err.message || "An error occurred while deleting the discount");
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/admin/discounts")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Discount Details</h2>
            <p className="text-muted-foreground">
              {discount.vas_merchants.business_name} - {discount.vas_products.product_name}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={discount.is_active ? "default" : "secondary"} className="text-base px-3 py-1">
            {discount.is_active ? "Active" : "Inactive"}
          </Badge>
          <Button
            variant="outline"
            onClick={() => router.push(`/admin/discounts/${discount.id}/edit`)}
          >
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={isDeleting}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the discount for{" "}
                  <strong>{discount.vas_products.product_name}</strong> from{" "}
                  <strong>{discount.vas_merchants.business_name}</strong>.
                </AlertDialogDescription>
                {deleteError && (
                  <div className="mt-2 text-sm text-destructive">{deleteError}</div>
                )}
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    "Delete"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Merchant Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Merchant Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Business Name</span>
                <span className="text-sm font-medium">{discount.vas_merchants.business_name}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Merchant Code</span>
                <Badge variant="outline" className="font-mono">
                  {discount.vas_merchants.merchant_code}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

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
                <span className="text-sm font-medium">{discount.vas_products.product_name}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Product Code</span>
                <Badge variant="outline" className="font-mono">
                  {discount.vas_products.product_code}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Discount Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Percent className="h-5 w-5" />
              Discount Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Discount Type</span>
                <Badge variant="outline" className="capitalize">
                  {discount.discount_type}
                </Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Discount Value</span>
                <span className="text-2xl font-bold">
                  {formatDiscount(discount.discount_type, discount.discount_value)}
                </span>
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
                <span className="text-sm">{formatDateTime(discount.created_at)}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Last Updated</span>
                <span className="text-sm">{formatDateTime(discount.updated_at)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

