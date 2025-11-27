import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Clock } from "lucide-react";

interface TransactionStatusBadgeProps {
  status: string;
  showIcon?: boolean;
}

export const TransactionStatusBadge = ({ status, showIcon = true }: TransactionStatusBadgeProps) => {
  const statusConfig: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; className: string; icon: any }> = {
    success: {
      variant: "default",
      className: "bg-green-500 hover:bg-green-600 text-white border-green-500",
      icon: CheckCircle2,
    },
    failed: {
      variant: "destructive",
      className: "",
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

