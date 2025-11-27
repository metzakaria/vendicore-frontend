"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft, User, Shield } from "lucide-react";

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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { 
  createUserSchema, 
  updateUserSchema,
  type CreateUserFormData,
  type UpdateUserFormData,
} from "@/lib/validations/user";
import { createUser } from "../_actions/createUser";
import { updateUser } from "../_actions/updateUser";

interface UserFormProps {
  mode: "create" | "edit";
  userId?: string;
  initialData?: {
    username?: string;
    email?: string;
    first_name?: string;
    last_name?: string;
    phone_number?: string;
    is_superuser?: boolean;
    is_staff?: boolean;
    is_active?: boolean;
  };
}

export const UserForm = ({ mode, userId, initialData }: UserFormProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditMode = mode === "edit";

  const form = useForm<CreateUserFormData | UpdateUserFormData>({
    resolver: zodResolver(isEditMode ? updateUserSchema : createUserSchema),
    defaultValues: {
      username: initialData?.username || "",
      email: initialData?.email || "",
      first_name: initialData?.first_name || "",
      last_name: initialData?.last_name || "",
      phone_number: initialData?.phone_number || "",
      password: "",
      is_superuser: initialData?.is_superuser || false,
      is_staff: initialData?.is_staff || false,
      is_active: initialData?.is_active ?? true,
    },
  });

  const onSubmit = async (data: CreateUserFormData | UpdateUserFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      if (isEditMode && userId) {
        // Remove password if empty in edit mode
        const updateData = { ...data } as UpdateUserFormData;
        if (!updateData.password || updateData.password.trim() === "") {
          delete updateData.password;
        }
        const result = await updateUser(userId, updateData);
        if (result.success && result.user) {
          window.location.href = `/admin/users/${userId}`;
        } else {
          setError(result.error || "Failed to update user");
        }
      } else {
        const result = await createUser(data as CreateUserFormData);
        if (result.success && result.user) {
          window.location.href = `/admin/users/${result.user.id}`;
        } else {
          setError(result.error || "Failed to create user");
        }
      }
    } catch (err: any) {
      setError(
        err.message ||
        `An error occurred while ${isEditMode ? "updating" : "creating"} the user`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (isEditMode && userId) {
      router.push(`/admin/users/${userId}`);
    } else {
      router.push("/admin/users");
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
        {isEditMode ? "Back to User Details" : "Back to Users"}
      </Button>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <Alert variant="destructive" role="alert" aria-live="polite">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            {/* User Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  User Information
                </CardTitle>
                <CardDescription>
                  {isEditMode ? "Update the user details" : "Enter the user details"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username *</FormLabel>
                      <FormControl>
                        <Input placeholder="johndoe" {...field} />
                      </FormControl>
                      <FormDescription>
                        Unique username for login
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email *</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="john@example.com" {...field} />
                      </FormControl>
                      <FormDescription>
                        User's email address
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="first_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="last_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="phone_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input type="tel" placeholder="+2348012345678" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password {isEditMode ? "(leave blank to keep current)" : "*"}</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormDescription>
                        {isEditMode 
                          ? "Leave blank to keep the current password" 
                          : "Minimum 8 characters"}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Permissions & Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Permissions & Status
                </CardTitle>
                <CardDescription>
                  Set user permissions and account status
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="is_superuser"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Superuser</FormLabel>
                        <FormDescription>
                          User has all permissions without explicitly assigning them.
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

                <FormField
                  control={form.control}
                  name="is_staff"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Staff</FormLabel>
                        <FormDescription>
                          User can access the admin site.
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

                <FormField
                  control={form.control}
                  name="is_active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Active</FormLabel>
                        <FormDescription>
                          Designates whether this user should be treated as active.
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
                isEditMode ? "Update User" : "Create User"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

