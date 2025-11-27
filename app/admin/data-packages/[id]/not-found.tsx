import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <h2 className="text-2xl font-bold">Data Package Not Found</h2>
      <p className="text-muted-foreground">
        The data package you are looking for does not exist.
      </p>
      <Button asChild>
        <Link href="/admin/data-packages">Back to Data Packages</Link>
      </Button>
    </div>
  );
}

