"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { loginSchema, type LoginFormData } from "@/lib/validations/auth";

export const LoginForm = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log("Attempting login for:", data.email);
      
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      console.log("SignIn result:", result);

      if (result?.error) {
        console.error("Login error:", result.error);
        setError(result.error === "CredentialsSignin" 
          ? "Invalid email or password" 
          : result.error);
        return;
      }

      if (result?.ok) {
        // Get the session to determine redirect
        const sessionResponse = await fetch("/api/auth/session");
        const session = await sessionResponse.json();
        
        console.log("Session after login:", session);
        console.log("User role:", session?.user?.role);
        console.log("User data:", session?.user);
        
        const role = session?.user?.role?.toLowerCase() || "";
        
        console.log("Normalized role:", role);
        
        if (role === "superadmin" || role === "admin") {
          console.log("Redirecting to admin dashboard");
          router.push("/admin/dashboard");
        } else {
          console.log("Redirecting to merchant dashboard");
          router.push("/dashboard");
        }
        router.refresh();
      }
    } catch (err) {
      console.error("Login exception:", err);
      setError(err instanceof Error ? err.message : "An error occurred during login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <Alert variant="destructive" role="alert" aria-live="polite">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-5">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="email" className="text-sm font-medium">
                  Email
                </FormLabel>
                <FormControl>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    autoComplete="email"
                    disabled={isLoading}
                    className="h-11"
                    aria-invalid={!!form.formState.errors.email}
                    aria-describedby={form.formState.errors.email ? "email-error" : undefined}
                    {...field}
                  />
                </FormControl>
                <FormMessage id="email-error" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="password" className="text-sm font-medium">
                  Password
                </FormLabel>
                <FormControl>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    autoComplete="current-password"
                    disabled={isLoading}
                    className="h-11"
                    aria-invalid={!!form.formState.errors.password}
                    aria-describedby={form.formState.errors.password ? "password-error" : undefined}
                    {...field}
                  />
                </FormControl>
                <FormMessage id="password-error" />
              </FormItem>
            )}
          />
        </div>

        <Button
          type="submit"
          className="w-full h-11 text-base font-medium"
          disabled={isLoading}
          aria-label={isLoading ? "Logging in..." : "Log in"}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
              Signing in...
            </>
          ) : (
            "Sign in"
          )}
        </Button>
      </form>
    </Form>
  );
};