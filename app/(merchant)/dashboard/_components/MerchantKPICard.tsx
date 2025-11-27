import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

interface MerchantKPICardProps {
  title: string;
  value: string | number | ReactNode;
  description?: string;
  icon: LucideIcon;
}

export const MerchantKPICard = ({
  title,
  value,
  description,
  icon: Icon,
}: MerchantKPICardProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
          <Icon className="h-6 w-6 text-indigo-700" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
};

