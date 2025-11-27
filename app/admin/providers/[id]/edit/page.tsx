import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getProviderAccountById } from "../../_actions/getProviderAccountById";
import { EditProviderAccountForm } from "./_components/EditProviderAccountForm";

export default async function EditProviderAccountPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const userRole = session.user.role?.toLowerCase();
  if (userRole !== "admin" && userRole !== "superadmin") {
    redirect("/login");
  }

  const { id } = await params;
  const account = await getProviderAccountById(id);

  if (!account) {
    notFound();
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Edit Provider Account</h2>
          <p className="text-muted-foreground">
            Update provider account information
          </p>
        </div>
      </div>

      <EditProviderAccountForm account={account} />
    </div>
  );
}

