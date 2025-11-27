import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground",
        "h-10 w-full min-w-0 rounded-md border border-input/80 bg-background px-3.5 py-2",
        "text-sm font-normal transition-all duration-200",
        "outline-none focus-visible:border-primary/60 focus-visible:ring-primary/10 focus-visible:ring-2",
        "hover:border-input",
        "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted/30",
        "dark:bg-input/20 dark:border-input/60 dark:focus-visible:border-primary/60 dark:focus-visible:ring-primary/20",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  )
}

export { Input }
