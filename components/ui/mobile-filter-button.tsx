import { Button } from "@/components/ui/button";
import { Filter, X } from "lucide-react";

interface MobileFilterButtonProps {
  showFilters: boolean;
  onToggle: () => void;
  filterCount?: number;
}

export const MobileFilterButton = ({ showFilters, onToggle, filterCount = 0 }: MobileFilterButtonProps) => {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onToggle}
      className="fixed bottom-6 right-6 z-50 rounded-full h-12 w-12 shadow-lg sm:hidden"
    >
      {showFilters ? (
        <X className="h-5 w-5" />
      ) : (
        <div className="relative">
          <Filter className="h-5 w-5" />
          {filterCount > 0 && (
            <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
              {filterCount}
            </span>
          )}
        </div>
      )}
    </Button>
  );
};