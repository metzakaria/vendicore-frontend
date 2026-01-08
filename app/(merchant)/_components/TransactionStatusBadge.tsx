import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Clock } from "lucide-react";
import React from "react"; // Import React to use React.ElementType

interface TransactionStatusBadgeProps {
  status: string;
  showIcon?: boolean;
}

export const TransactionStatusBadge = ({ status, showIcon = true }: TransactionStatusBadgeProps) => {
  const statusConfig: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; className: string; icon: React.ElementType }> = { // Changed any to React.ElementType
    success: {
      variant: "default",
      className: "bg-green-500 hover:bg-green-600 text-white border-green-500",
      icon: CheckCircle2,
    },
    failed: {
      variant: "destructive",
      className: "bg-red-500/10 text-red-700 dark:text-red-400", // Added class for consistency
      icon: XCircle,
    },
    pending: {
      variant: "secondary",
      className: "bg-blue-500 hover:bg-blue-600 text-white border-blue-500",
      icon: Clock,
    },
  };
  
  const config = statusConfig[status.toLowerCase()] || {
    variant: "outline" as const,
    className: "",
    icon: Clock,
  };
  
  const Icon = config.icon;
  
  return (
    <Badge 
      variant={config.variant} 
      className={`flex items-center gap-1 w-fit ${config.className} ${!showIcon ? 'gap-0' : ''}`}
    >
      {showIcon && <Icon className="h-3 w-3" />}
      {status.toUpperCase()}
    </Badge>
  );
};

