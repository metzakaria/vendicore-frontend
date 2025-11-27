"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { 
  createDataPackageSchema, 
  updateDataPackageSchema,
  type CreateDataPackageFormData,
  type UpdateDataPackageFormData,
} from "@/lib/validations/dataPackage";
import { createDataPackage } from "../_actions/createDataPackage";
import { updateDataPackage } from "../_actions/updateDataPackage";
import { getProductsForDropdown } from "../_actions/getProductsForDropdown";

interface DataPackageFormProps {
  mode: "create" | "edit";
  packageId?: string;
  initialData?: {
    data_code?: string;
    tariff_id?: string;
    amount?: string;
    description?: string;
    duration?: string;
    value?: string;
    product_id?: string;
    is_active?: boolean;
  };
}

export const DataPackageForm = ({ mode, packageId, initialData }: DataPackageFormProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditMode = mode === "edit";

  // Fetch products for dropdown
  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ["products-dropdown"],
    queryFn: () => getProductsForDropdown(),
    staleTime: 300000,
  });

  const form = useForm<CreateDataPackageFormData | UpdateDataPackageFormData>({
    resolver: zodResolver(isEditMode ? updateDataPackageSchema : createDataPackageSchema),
    defaultValues: {
      data_code: initialData?.data_code || "",
      tariff_id: initialData?.tariff_id || "",
      amount: initialData?.amount || "",
      description: initialData?.description || "",
      duration: initialData?.duration || "",
      value: initialData?.value || "",
      product_id: initialData?.product_id || "",
      is_active: initialData?.is_active ?? true,
    },
  });

  const onSubmit = async (data: CreateDataPackageFormData | UpdateDataPackageFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      if (isEditMode && packageId) {
        const result = await updateDataPackage(packageId, data as UpdateDataPackageFormData);
        if (result.success && result.package) {
          window.location.href = `/admin/data-packages/${packageId}`;
        } else {
          setError(result.error || "Failed to update data package");
        }
      } else {
        const result = await createDataPackage(data as CreateDataPackageFormData);
        if (result.success && result.package) {
          window.location.href = `/admin/data-packages/${result.package.id}`;
        } else {
          setError(result.error || "Failed to create data package");
        }
      }
    } catch (err: any) {
      setError(
        err.message ||
        `An error occurred while ${isEditMode ? "updating" : "creating"} the data package`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (isEditMode && packageId) {
      router.push(`/admin/data-packages/${packageId}`);
    } else {
      router.push("/admin/data-packages");
    }
  };

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        onClick={handleCancel}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        {isEditMode ? "Back to Package Details" : "Back to Data Packages"}
      </Button>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <Alert variant="destructive" role="alert" aria-live="polite">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            {/* Package Information */}
            <Card>
              <CardHeader>
                <CardTitle>Package Information</CardTitle>
                <CardDescription>
                  {isEditMode ? "Update the package details" : "Enter the package details"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="data_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data Code *</FormLabel>
                      <FormControl>
                        <Input placeholder="MTN_1GB_30D" {...field} />
                      </FormControl>
                      <FormDescription>
                        Unique code for this data package
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tariff_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tariff ID</FormLabel>
                      <FormControl>
                        <Input placeholder="TAR123" {...field} />
                      </FormControl>
                      <FormDescription>
                        Optional tariff identifier
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="1GB data valid for 30 days"
                          className="resize-none"
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="product_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product *</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value}
                        disabled={productsLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a product" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {productsLoading ? (
                            <SelectItem value="loading" disabled>Loading products...</SelectItem>
                          ) : products && products.length > 0 ? (
                            products.map((product) => (
                              <SelectItem key={product.id} value={product.id}>
                                {product.product_name} ({product.product_code})
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="none" disabled>No products available</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Select the product this package belongs to
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Package Details */}
            <Card>
              <CardHeader>
                <CardTitle>Package Details</CardTitle>
                <CardDescription>
                  Set the package value and pricing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount (NGN) *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="1000.00"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Price of the data package
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Value *</FormLabel>
                      <FormControl>
                        <Input placeholder="1GB" {...field} />
                      </FormControl>
                      <FormDescription>
                        Data value (e.g., 1GB, 2GB, 5GB)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration *</FormLabel>
                      <FormControl>
                        <Input placeholder="30 days" {...field} />
                      </FormControl>
                      <FormDescription>
                        Validity period (e.g., 30 days, 1 month)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Active Status</FormLabel>
                        <FormDescription>
                          Enable or disable this package
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          <div className="flex items-center justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || productsLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditMode ? "Updating..." : "Creating..."}
                </>
              ) : (
                isEditMode ? "Update Package" : "Create Package"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

