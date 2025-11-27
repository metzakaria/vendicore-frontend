import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { TransactionReport } from "./_components/TransactionReport";

export default async function TransactionReportPage() {
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
      <TransactionReport />
    </div>
  );
}

