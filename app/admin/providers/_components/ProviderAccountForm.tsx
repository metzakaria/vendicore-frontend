"use client";

import { useState, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft, Settings } from "lucide-react";
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { 
  createProviderAccountSchema, 
  updateProviderAccountSchema,
  type CreateProviderAccountFormData,
  type UpdateProviderAccountFormData,
} from "@/lib/validations/providerAccount";
import { createProviderAccount } from "../new/_actions/createProviderAccount";
import { updateProviderAccount } from "../[id]/edit/_actions/updateProviderAccount";
import { getProvidersForDropdown } from "../_actions/getProvidersForDropdown";
import { getProviderByIdWithSchema } from "../_actions/getProviderByIdWithSchema";

interface ProviderAccountFormProps {
  mode: "create" | "edit";
  accountId?: string;
  initialData?: {
    account_name?: string;
    provider_id?: string;
    available_balance?: number;
    balance_at_provider?: number;
    vending_sim?: string;
    config?: Record<string, any>;
    config_schema?: Record<string, any>;
  };
}

export const ProviderAccountForm = ({ mode, accountId, initialData }: ProviderAccountFormProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditMode = mode === "edit";

  // Fetch providers for dropdown
  const { data: providers, isLoading: providersLoading } = useQuery({
    queryKey: ["providers-dropdown"],
    queryFn: () => getProvidersForDropdown(),
    staleTime: 300000, // 5 minutes
  });

  const form = useForm<CreateProviderAccountFormData | UpdateProviderAccountFormData>({
    resolver: zodResolver(isEditMode ? updateProviderAccountSchema : createProviderAccountSchema),
    defaultValues: {
      account_name: initialData?.account_name || "",
      provider_id: initialData?.provider_id || "",
      available_balance: initialData?.available_balance?.toString() || "0",
      balance_at_provider: initialData?.balance_at_provider?.toString() || "0",
      vending_sim: initialData?.vending_sim || "",
      config: initialData?.config || {},
    },
  });

  // Watch provider_id to fetch config schema
  const selectedProviderId = useWatch({
    control: form.control,
    name: "provider_id",
  });

  // Fetch provider config schema when provider is selected
  const { data: selectedProvider, isLoading: schemaLoading } = useQuery({
    queryKey: ["provider-schema", selectedProviderId],
    queryFn: () => getProviderByIdWithSchema(selectedProviderId || ""),
    enabled: !!selectedProviderId,
    staleTime: 300000,
  });

  // Get config schema (from selected provider or initial data)
  const configSchema = selectedProvider?.config_schema || initialData?.config_schema || {};

  // Initialize config fields when provider changes or on edit mode
  useEffect(() => {
    if (selectedProviderId && selectedProvider?.config_schema) {
      const schema = selectedProvider.config_schema as Record<string, any>;
      const currentConfig = form.getValues("config") || {};
      const newConfig: Record<string, any> = {};

      // Initialize config fields from schema
      Object.keys(schema).forEach((key) => {
        newConfig[key] = currentConfig[key] || "";
      });

      form.setValue("config", newConfig);
    } else if (isEditMode && initialData?.config) {
      // In edit mode, use existing config
      form.setValue("config", initialData.config);
    }
  }, [selectedProviderId, selectedProvider, isEditMode, form, initialData?.config]);

  const onSubmit = async (data: CreateProviderAccountFormData | UpdateProviderAccountFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      // Build config object from form values and validate required fields
      const config: Record<string, any> = {};
      const schema = configSchema as Record<string, any>;
      const missingRequired: string[] = [];
      
      if (schema && Object.keys(schema).length > 0) {
        Object.keys(schema).forEach((key) => {
          const fieldSchema = schema[key];
          const configValue = form.getValues(`config.${key}` as any);
          
          // Check if field is required
          if (fieldSchema.required === true) {
            if (configValue === undefined || configValue === null || configValue === "") {
              missingRequired.push(key);
            }
          }
          
          if (configValue !== undefined && configValue !== null && configValue !== "") {
            config[key] = configValue;
          }
        });
      }

      // Validate required fields
      if (missingRequired.length > 0) {
        const fieldNames = missingRequired.map(key => 
          key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " ")
        ).join(", ");
        setError(`Please fill in all required configuration fields: ${fieldNames}`);
        setIsLoading(false);
        return;
      }

      const formData = {
        ...data,
        config,
      };

      if (isEditMode && accountId) {
        const result = await updateProviderAccount(accountId, formData as UpdateProviderAccountFormData);
        console.log("Update result:", result);
        if (result.success && result.account) {
          console.log("Navigating to:", `/admin/providers`);
          // Use window.location for more reliable navigation
          window.location.href = `/admin/providers`;
        } else {
          const errorMsg = result.error || "Failed to update provider account";
          console.error("Update failed:", errorMsg);
          setError(errorMsg);
        }
      } else {
        const result = await createProviderAccount(formData as CreateProviderAccountFormData);
        console.log("Create result:", result);
        if (result.success && result.account) {
          console.log("Navigating to:", `/admin/providers`);
          // Use window.location for more reliable navigation
          window.location.href = `/admin/providers`;
        } else {
          const errorMsg = result.error || "Failed to create provider account";
          console.error("Create failed:", errorMsg);
          setError(errorMsg);
        }
      }
    } catch (err: any) {
      setError(
        err.message ||
        `An error occurred while ${isEditMode ? "updating" : "creating"} the provider account`
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
Back to Provider Accounts
      </Button>

      <Form {...form}>
        <form 
          onSubmit={form.handleSubmit(onSubmit)} 
          className="space-y-6"
        >
          {error && (
            <Alert variant="destructive" role="alert" aria-live="polite">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            {/* Account Information */}
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>
                  {isEditMode ? "Update the account details" : "Enter the account details"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="account_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Main Account" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="provider_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Provider *</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value}
                        disabled={providersLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a provider" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {providersLoading ? (
                            <SelectItem value="loading" disabled>Loading providers...</SelectItem>
                          ) : providers && providers.length > 0 ? (
                            providers.map((provider) => (
                              <SelectItem key={provider.id} value={provider.id}>
                                {provider.name} ({provider.provider_code})
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="none" disabled>No providers available</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Select the provider for this account
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="vending_sim"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vending SIM</FormLabel>
                      <FormControl>
                        <Input placeholder="08012345678" {...field} />
                      </FormControl>
                      <FormDescription>
                        Optional: SIM card number for vending
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Balance Information */}
            <Card>
              <CardHeader>
                <CardTitle>Balance Information</CardTitle>
                <CardDescription>
                  Set initial balances for the account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="available_balance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Available Balance</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Current available balance in the system
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="balance_at_provider"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Balance at Provider</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Balance as reported by the provider
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          {/* Provider Configuration */}
          {selectedProviderId && Object.keys(configSchema).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Provider Configuration
                </CardTitle>
                <CardDescription>
                  Configure provider-specific settings for this account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {schemaLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    <span className="ml-2 text-sm text-muted-foreground">Loading configuration...</span>
                  </div>
                ) : (
                  Object.entries(configSchema as Record<string, any>).map(([key, fieldSchema]) => {
                    const fieldType = fieldSchema.type || "string";
                    const isRequired = fieldSchema.required === true;
                    const description = fieldSchema.description || "";
                    const fieldName = `config.${key}` as any;

                    return (
                      <FormField
                        key={key}
                        control={form.control}
                        name={fieldName}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " ")}
                              {isRequired && " *"}
                            </FormLabel>
                            <FormControl>
                              {fieldType === "string" ? (
                                <Input
                                  type={key.toLowerCase().includes("password") ? "password" : "text"}
                                  placeholder={`Enter ${key.replace(/_/g, " ")}`}
                                  {...field}
                                  value={field.value || ""}
                                />
                              ) : fieldType === "number" ? (
                                <Input
                                  type="number"
                                  step="0.01"
                                  placeholder={`Enter ${key.replace(/_/g, " ")}`}
                                  {...field}
                                  value={field.value || ""}
                                  onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : "")}
                                />
                              ) : (
                                <Input
                                  placeholder={`Enter ${key.replace(/_/g, " ")}`}
                                  {...field}
                                  value={field.value || ""}
                                />
                              )}
                            </FormControl>
                            {description && (
                              <FormDescription>{description}</FormDescription>
                            )}
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    );
                  })
                )}
              </CardContent>
            </Card>
          )}

          <div className="flex items-center justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || providersLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditMode ? "Updating..." : "Creating..."}
                </>
              ) : (
                isEditMode ? "Update Account" : "Create Account"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

