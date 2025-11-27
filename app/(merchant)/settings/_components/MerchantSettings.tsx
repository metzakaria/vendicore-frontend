"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Key, Eye, EyeOff, Copy, RefreshCw, Lock, AlertCircle, CheckCircle, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { format } from "date-fns";
import { getMerchantApiCredentials } from "../_actions/getMerchantApiCredentials";
import { regenerateApiToken } from "../_actions/regenerateApiToken";
import { changePassword } from "../_actions/changePassword";
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

export const MerchantSettings = () => {
  const queryClient = useQueryClient();
  const [showApiToken, setShowApiToken] = useState(false);
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  
  // Password form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["merchant-api-credentials"],
    queryFn: async () => {
      const result = await getMerchantApiCredentials();
      if (result.error) {
        throw new Error(result.error);
      }
      return result;
    },
    retry: 1,
    staleTime: 300000,
  });

  const formatDateTime = (date: string | Date | null) => {
    if (!date) return "N/A";
    return format(new Date(date), "MMM dd, yyyy HH:mm");
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setMessage({ type: "success", text: `${label} copied to clipboard` });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleRegenerateToken = async () => {
    setIsRegenerating(true);
    try {
      const result = await regenerateApiToken();
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ["merchant-api-credentials"] });
        setMessage({ type: "success", text: "API token regenerated successfully" });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: "error", text: result.error || "Failed to regenerate API token" });
        setTimeout(() => setMessage(null), 5000);
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "An unknown error occurred",
      });
      setTimeout(() => setMessage(null), 5000);
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match" });
      setTimeout(() => setMessage(null), 5000);
      return;
    }

    if (newPassword.length < 8) {
      setMessage({ type: "error", text: "Password must be at least 8 characters" });
      setTimeout(() => setMessage(null), 5000);
      return;
    }

    setIsChangingPassword(true);
    try {
      const result = await changePassword({
        currentPassword,
        newPassword,
      });

      if (result.success) {
        setMessage({ type: "success", text: "Password changed successfully" });
        setTimeout(() => setMessage(null), 3000);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setMessage({ type: "error", text: result.error || "Failed to change password" });
        setTimeout(() => setMessage(null), 5000);
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "An unknown error occurred",
      });
      setTimeout(() => setMessage(null), 5000);
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-destructive">
            <p>Error loading settings. Please try again.</p>
            <p className="text-xs mt-2">{error instanceof Error ? error.message : String(error)}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Manage your account settings and API credentials
        </p>
      </div>

      {/* Message Alert */}
      {message && (
        <Alert variant={message.type === "error" ? "destructive" : "default"}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {message.type === "success" ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertDescription>{message.text}</AlertDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setMessage(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </Alert>
      )}

      {/* API Credentials */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            API Credentials
          </CardTitle>
          <CardDescription>
            Your API token and secret key for accessing the VAS API
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* API Token */}
          <div className="space-y-2">
            <Label>API Token</Label>
            <div className="flex items-center gap-2">
              <Input
                type={showApiToken ? "text" : "password"}
                value={data?.api_token || ""}
                readOnly
                className="font-mono"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowApiToken(!showApiToken)}
              >
                {showApiToken ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
              {data?.api_token && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleCopy(data.api_token!, "API Token")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* API Secret Key */}
          <div className="space-y-2">
            <Label>API Secret Key</Label>
            <div className="flex items-center gap-2">
              <Input
                type={showSecretKey ? "text" : "password"}
                value={data?.api_secret_key || ""}
                readOnly
                className="font-mono"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowSecretKey(!showSecretKey)}
              >
                {showSecretKey ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
              {data?.api_secret_key && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleCopy(data.api_secret_key!, "Secret Key")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Token Info */}
          <div className="grid gap-4 md:grid-cols-2 pt-2 border-t">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Token Created</p>
              <p className="text-sm mt-1">{formatDateTime(data?.api_token_created)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Token Expires</p>
              <p className="text-sm mt-1">{formatDateTime(data?.api_token_expire)}</p>
            </div>
            {data?.api_access_ip && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Allowed IP</p>
                <p className="text-sm font-mono mt-1">{data.api_access_ip}</p>
              </div>
            )}
          </div>

          {/* Regenerate Button */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" disabled={isRegenerating}>
                <RefreshCw className={`mr-2 h-4 w-4 ${isRegenerating ? "animate-spin" : ""}`} />
                {isRegenerating ? "Regenerating..." : "Regenerate API Token"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Regenerate API Token?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will generate a new API token and secret key. Your current API credentials will no longer work.
                  Make sure to update your applications with the new credentials.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleRegenerateToken}>
                  Regenerate
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Change Password
          </CardTitle>
          <CardDescription>
            Update your account password
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input
              id="currentPassword"
              type="password"
              placeholder="Enter current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              type="password"
              placeholder="Enter new password (min 8 characters)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <Button
            onClick={handleChangePassword}
            disabled={isChangingPassword || !currentPassword || !newPassword || !confirmPassword}
          >
            {isChangingPassword ? "Changing..." : "Change Password"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

