"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft } from "lucide-react";

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
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { 
  createProviderSchema, 
  updateProviderSchema,
  type CreateProviderFormData,
  type UpdateProviderFormData,
} from "@/lib/validations/provider";
import { createProvider } from "../new/_actions/createProvider";
import { updateProvider } from "../[id]/edit/_actions/updateProvider";

interface ProviderFormProps {
  mode: "create" | "edit";
  providerId?: string;
  initialData?: {
    name?: string;
    provider_code?: string;
    description?: string;
    is_active?: boolean;
  };
}

export const ProviderForm = ({ mode, providerId, initialData }: ProviderFormProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditMode = mode === "edit";

  const form = useForm<CreateProviderFormData | UpdateProviderFormData>({
    resolver: zodResolver(isEditMode ? updateProviderSchema : createProviderSchema),
    defaultValues: {
      name: initialData?.name || "",
      provider_code: initialData?.provider_code || "",
      description: initialData?.description || "",
      is_active: initialData?.is_active ?? true,
    },
  });

  const onSubmit = async (data: CreateProviderFormData | UpdateProviderFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      if (isEditMode && providerId) {
        const result = await updateProvider(providerId, data as UpdateProviderFormData);
        if (result.success && result.provider) {
          router.push("/admin/providers");
          router.refresh();
        } else {
          setError(result.error || "Failed to update provider");
        }
      } else {
        const result = await createProvider(data as CreateProviderFormData);
        if (result.success && result.provider) {
          router.push("/admin/providers");
          router.refresh();
        } else {
          setError(result.error || "Failed to create provider");
        }
      }
    } catch (err: any) {
      setError(
        err.message ||
        `An error occurred while ${isEditMode ? "updating" : "creating"} the provider`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push("/admin/providers");
  };

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        onClick={handleCancel}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
Back to Providers
      </Button>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <Alert variant="destructive" role="alert" aria-live="polite">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            {/* Provider Information */}
            <Card>
              <CardHeader>
                <CardTitle>Provider Information</CardTitle>
                <CardDescription>
                  {isEditMode ? "Update the provider details" : "Enter the provider details"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Provider Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="MTN Nigeria" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="provider_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Provider Code *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="MTN" 
                          {...field}
                          disabled={isEditMode}
                          className={isEditMode ? "bg-muted" : ""}
                        />
                      </FormControl>
                      <FormDescription>
                        {isEditMode 
                          ? "Provider code cannot be changed after creation"
                          : "Unique code identifier for the provider"
                        }
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
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Brief description of the provider"
                          className="resize-none"
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Settings</CardTitle>
                <CardDescription>
                  Configure provider settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Separator />

                <FormField
                  control={form.control}
                  name="is_active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Active Status</FormLabel>
                        <FormDescription>
                          Enable or disable the provider
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
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditMode ? "Updating..." : "Creating..."}
                </>
              ) : (
                isEditMode ? "Update Provider" : "Create Provider"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

