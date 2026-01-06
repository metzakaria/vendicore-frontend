import { Loader2 } from "lucide-react";
import React from "react";

interface TableOverlayLoaderProps {
  isVisible: boolean;
  label?: string;
}

export const TableOverlayLoader = ({
  isVisible,
  label = "Loading results...",
}: TableOverlayLoaderProps) => {
  if (!isVisible) return null;

  return (
    <div
      className="absolute inset-0 z-20 flex items-center justify-center bg-background/70 backdrop-blur-sm"
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <div className="flex items-center gap-3 rounded-lg border bg-card px-4 py-3 shadow-sm">
        <Loader2 className="h-5 w-5 animate-spin text-primary" aria-hidden="true" />
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
    </div>
  );
};


