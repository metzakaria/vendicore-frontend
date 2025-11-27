import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <h2 className="text-2xl font-bold">Discount Not Found</h2>
      <p className="text-muted-foreground">
        The discount you are looking for does not exist.
      </p>
      <Button asChild>
        <Link href="/admin/discounts">Back to Discounts</Link>
      </Button>
    </div>
  );
}

