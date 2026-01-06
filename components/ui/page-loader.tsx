import { Loader2 } from "lucide-react";
import React from "react";

export const PageLoader = ({
  label = "Loading...",
}: {
  label?: string;
}) => {
  return (
    <div
      className="flex min-h-[60vh] items-center justify-center px-4"
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <div className="flex items-center gap-3 rounded-xl border bg-card px-5 py-4 shadow-sm">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
          <Loader2 className="h-6 w-6 animate-spin text-primary" aria-hidden="true" />
        </span>
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">{label}</p>
          <p className="text-xs text-muted-foreground">
            Please hold on while we prepare this page.
          </p>
        </div>
      </div>
    </div>
  );
};


