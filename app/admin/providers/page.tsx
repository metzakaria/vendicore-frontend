import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ProviderAccountList } from "./_components/ProviderAccountList";

export default async function ProviderAccountsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const userRole = session.user.role?.toLowerCase();
  if (userRole !== "admin" && userRole !== "superadmin") {
    redirect("/login");
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Provider Accounts</h2>
          <p className="text-muted-foreground">
            Manage all provider accounts on the platform
          </p>
        </div>
      </div>

      <ProviderAccountList />
    </div>
  );
}

