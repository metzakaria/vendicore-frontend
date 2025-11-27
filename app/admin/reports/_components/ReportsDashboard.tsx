"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  FileText, 
  TrendingUp, 
  DollarSign, 
  Users, 
  ShoppingCart, 
  CreditCard,
  BarChart3,
  Calendar
} from "lucide-react";

const reportTypes = [
  {
    id: "transactions",
    title: "Transaction Report",
    description: "View detailed transaction reports with filters",
    icon: ShoppingCart,
    href: "/admin/reports/transactions",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    id: "merchants",
    title: "Merchant Performance",
    description: "Analyze merchant activity and performance metrics",
    icon: Users,
    href: "/admin/reports/merchants",
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  {
    id: "funding",
    title: "Funding Report",
    description: "Track all merchant funding requests and approvals",
    icon: CreditCard,
    href: "/admin/reports/funding",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
  {
    id: "revenue",
    title: "Revenue Report",
    description: "Financial overview and revenue analytics",
    icon: DollarSign,
    href: "/admin/reports/revenue",
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
  },
  {
    id: "products",
    title: "Product Usage",
    description: "Product performance and usage statistics",
    icon: TrendingUp,
    href: "/admin/reports/products",
    color: "text-orange-600",
    bgColor: "bg-orange-50",
  },
  {
    id: "summary",
    title: "Summary Report",
    description: "Comprehensive dashboard with key metrics",
    icon: BarChart3,
    href: "/admin/reports/summary",
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
  },
];

export const ReportsDashboard = () => {
  const router = useRouter();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Reports</h2>
        <p className="text-muted-foreground">
          Generate and view detailed reports for your VAS platform
        </p>
      </div>

      {/* Report Types Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {reportTypes.map((report) => {
          const Icon = report.icon;
          return (
            <Card
              key={report.id}
              className="cursor-pointer transition-all hover:shadow-md hover:scale-[1.02]"
              onClick={() => router.push(report.href)}
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${report.bgColor}`}>
                    <Icon className={`h-6 w-6 ${report.color}`} />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{report.title}</CardTitle>
                  </div>
                </div>
                <CardDescription className="mt-2">
                  {report.description}
                </CardDescription>
              </CardHeader>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

