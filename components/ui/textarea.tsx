import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border-input/80 placeholder:text-muted-foreground",
        "flex field-sizing-content min-h-20 w-full rounded-md border bg-background px-3.5 py-2.5",
        "text-sm font-normal transition-all duration-200",
        "outline-none focus-visible:border-primary/60 focus-visible:ring-primary/10 focus-visible:ring-2",
        "hover:border-input",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        "dark:bg-input/20 dark:border-input/60 dark:focus-visible:border-primary/60 dark:focus-visible:ring-primary/20",
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted/30",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
