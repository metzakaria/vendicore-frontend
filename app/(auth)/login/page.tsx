import type { Metadata } from "next";
import { LoginForm } from "./_components/LoginForm";

export const metadata: Metadata = {
  title: "Login | Airtime & Data Vending Platform",
  description: "Login to your admin or merchant account",
};

const LoginPage = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-semibold tracking-tight">Welcome back</h1>
          <p className="text-muted-foreground">
            Sign in to your account to continue
          </p>
        </div>
        <div className="rounded-lg border bg-card p-8 shadow-sm">
          <LoginForm />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

