"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Activity,
  CreditCard,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Transactions",
    href: "/transactions",
    icon: Activity,
  },
  {
    name: "Funding",
    href: "/funding",
    icon: CreditCard,
  },
  {
    name: "Discounts",
    href: "/discounts",
    icon: TrendingUp,
  },
];

export const MerchantSidebar = () => {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col border-r border-sidebar-border bg-sidebar gradient-sidebar shadow-sidebar">
      <div className="flex h-16 items-center border-b border-sidebar-border px-6">
        <h1 className="text-lg font-semibold text-sidebar-foreground">TELKO VAS</h1>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 cursor-pointer",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon className="h-5 w-5 text-inherit" />
              <span className="text-inherit">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

