import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <h2 className="text-2xl font-bold">Funding Request Not Found</h2>
      <p className="text-muted-foreground">
        The funding request you are looking for does not exist or you don&apos;t have access to it.
      </p>
      <Button asChild>
        <Link href="/funding">Back to Funding Requests</Link>
      </Button>
    </div>
  );
}

