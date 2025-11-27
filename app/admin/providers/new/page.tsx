import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CreateProviderAccountForm } from "./_components/CreateProviderAccountForm";

export const metadata = {
  title: "Add New Provider Account | Admin",
  description: "Create a new provider account on the platform.",
};

export default async function CreateProviderAccountPage() {
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
          <h2 className="text-3xl font-bold tracking-tight">Add New Provider Account</h2>
          <p className="text-muted-foreground">
            Fill in the details to create a new provider account.
          </p>
        </div>
      </div>
      <CreateProviderAccountForm />
    </div>
  );
}

