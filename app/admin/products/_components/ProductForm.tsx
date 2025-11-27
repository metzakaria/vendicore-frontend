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
  createProductSchema, 
  updateProductSchema,
  type CreateProductFormData,
  type UpdateProductFormData,
} from "@/lib/validations/product";
import { createProduct } from "../_actions/createProduct";
import { updateProduct } from "../_actions/updateProduct";
import { getCategoriesForDropdown } from "../_actions/getCategoriesForDropdown";
import { getProviderAccountsForDropdown } from "../_actions/getProviderAccountsForDropdown";

interface ProductFormProps {
  mode: "create" | "edit";
  productId?: string;
  initialData?: {
    product_name?: string;
    product_code?: string;
    description?: string;
    category_id?: string;
    preferred_provider_account_id?: string;
    backup_provider_account_id?: string;
    is_active?: boolean;
  };
}

export const ProductForm = ({ mode, productId, initialData }: ProductFormProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditMode = mode === "edit";

  // Fetch categories and provider accounts for dropdowns
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ["product-categories"],
    queryFn: () => getCategoriesForDropdown(),
    staleTime: 300000,
  });

  const { data: providerAccounts, isLoading: providerAccountsLoading } = useQuery({
    queryKey: ["provider-accounts-dropdown"],
    queryFn: () => getProviderAccountsForDropdown(),
    staleTime: 300000,
  });

  const form = useForm<CreateProductFormData | UpdateProductFormData>({
    resolver: zodResolver(isEditMode ? updateProductSchema : createProductSchema),
    defaultValues: {
      product_name: initialData?.product_name || "",
      product_code: initialData?.product_code || "",
      description: initialData?.description || "",
      category_id: initialData?.category_id || "",
      preferred_provider_account_id: initialData?.preferred_provider_account_id || "",
      backup_provider_account_id: initialData?.backup_provider_account_id || "",
      is_active: initialData?.is_active ?? true,
    },
  });

  const onSubmit = async (data: CreateProductFormData | UpdateProductFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      if (isEditMode && productId) {
        const result = await updateProduct(productId, data as UpdateProductFormData);
        if (result.success && result.product) {
          window.location.href = `/admin/products/${productId}`;
        } else {
          setError(result.error || "Failed to update product");
        }
      } else {
        const result = await createProduct(data as CreateProductFormData);
        if (result.success && result.product) {
          window.location.href = `/admin/products/${result.product.id}`;
        } else {
          setError(result.error || "Failed to create product");
        }
      }
    } catch (err: any) {
      setError(
        err.message ||
        `An error occurred while ${isEditMode ? "updating" : "creating"} the product`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (isEditMode && productId) {
      router.push(`/admin/products/${productId}`);
    } else {
      router.push("/admin/products");
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
        {isEditMode ? "Back to Product Details" : "Back to Products"}
      </Button>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <Alert variant="destructive" role="alert" aria-live="polite">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            {/* Product Information */}
            <Card>
              <CardHeader>
                <CardTitle>Product Information</CardTitle>
                <CardDescription>
                  {isEditMode ? "Update the product details" : "Enter the product details"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="product_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Airtime" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="product_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Code *</FormLabel>
                      <FormControl>
                        <Input placeholder="AIR" {...field} />
                      </FormControl>
                      <FormDescription>
                        Unique code for this product
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
                          placeholder="Product description"
                          className="resize-none"
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category *</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value}
                        disabled={categoriesLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categoriesLoading ? (
                            <SelectItem value="loading" disabled>Loading categories...</SelectItem>
                          ) : categories && categories.length > 0 ? (
                            categories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name} ({category.category_code})
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="none" disabled>No categories available</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Select the product category
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Provider Configuration */}
            <Card>
              <CardHeader>
                <CardTitle>Provider Configuration</CardTitle>
                <CardDescription>
                  Configure provider accounts for this product
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="preferred_provider_account_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preferred Provider Account</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(value === "_none" ? "" : value)} 
                        value={field.value || "_none"}
                        disabled={providerAccountsLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select preferred provider account" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="_none">None</SelectItem>
                          {providerAccountsLoading ? (
                            <SelectItem value="_loading" disabled>Loading provider accounts...</SelectItem>
                          ) : providerAccounts && providerAccounts.length > 0 ? (
                            providerAccounts.map((account) => (
                              <SelectItem key={account.id} value={account.id}>
                                {account.account_name} ({account.vas_providers.provider_code})
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="_empty" disabled>No provider accounts available</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Primary provider account to use for this product
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="backup_provider_account_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Backup Provider Account</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(value === "_none" ? "" : value)} 
                        value={field.value || "_none"}
                        disabled={providerAccountsLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select backup provider account" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="_none">None</SelectItem>
                          {providerAccountsLoading ? (
                            <SelectItem value="_loading" disabled>Loading provider accounts...</SelectItem>
                          ) : providerAccounts && providerAccounts.length > 0 ? (
                            providerAccounts.map((account) => (
                              <SelectItem key={account.id} value={account.id}>
                                {account.account_name} ({account.vas_providers.provider_code})
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="_empty" disabled>No provider accounts available</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Backup provider account if preferred fails
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
                          Enable or disable this product
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
            <Button type="submit" disabled={isLoading || categoriesLoading || providerAccountsLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditMode ? "Updating..." : "Creating..."}
                </>
              ) : (
                isEditMode ? "Update Product" : "Create Product"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

