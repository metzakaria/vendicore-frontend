"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User, Settings, Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export const MerchantHeader = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut({ redirect: false });
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
      router.push("/login");
    }
  };

  const getInitials = (name?: string | null) => {
    if (!name) return "M";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-card px-4 sm:px-6">
      {/* Left section */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Mobile search toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="sm:hidden"
          onClick={() => setShowMobileSearch(!showMobileSearch)}
        >
          <Search className="h-5 w-5" />
        </Button>

        {/* Title */}
        <h2 className="text-sm font-medium text-muted-foreground truncate">
          Merchant Portal
        </h2>
      </div>

      {/* Mobile search bar */}
      {showMobileSearch && (
        <div className="absolute top-16 left-0 right-0 bg-card border-b p-4 sm:hidden">
          <Input
            placeholder="Search..."
            className="w-full"
            onBlur={() => setShowMobileSearch(false)}
            autoFocus
          />
        </div>
      )}

      {/* Right section */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Desktop search */}
        <div className="hidden sm:flex relative w-48 lg:w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search transactions..."
            className="pl-9"
          />
        </div>

        {/* Notifications - Desktop only */}
        <Button
          variant="ghost"
          size="icon"
          className="hidden sm:flex"
        >
          <Bell className="h-5 w-5" />
          <span className="sr-only">Notifications</span>
        </Button>

        {/* User dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 sm:gap-3 rounded-lg px-2 sm:px-3 py-2 hover:bg-accent cursor-pointer transition-colors">
              {/* Avatar on mobile, full info on desktop */}
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs sm:text-sm">
                  {getInitials(session?.user?.name)}
                </AvatarFallback>
              </Avatar>
              
              {/* User info - hidden on mobile */}
              <div className="hidden sm:flex flex-col items-start text-left">
                <span className="text-sm font-medium truncate max-w-[120px] lg:max-w-[150px]">
                  {session?.user?.name || "Merchant"}
                </span>
                <span className="text-xs text-muted-foreground truncate max-w-[120px] lg:max-w-[150px]">
                  {session?.user?.email}
                </span>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none truncate">
                  {session?.user?.name || "Merchant"}
                </p>
                <p className="text-xs leading-none text-muted-foreground truncate">
                  {session?.user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile" className="flex items-center w-full">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings" className="flex items-center w-full">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={handleSignOut} 
              className="text-destructive focus:text-destructive cursor-pointer"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};