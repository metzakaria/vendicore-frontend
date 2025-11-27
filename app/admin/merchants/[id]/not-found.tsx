import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex-1 flex items-center justify-center p-4 md:p-8">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle>Merchant Not Found</CardTitle>
          <CardDescription>
            The merchant you're looking for doesn't exist or has been removed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/admin/merchants">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Merchants
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

