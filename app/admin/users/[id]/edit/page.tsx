import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getUserById } from "../../_actions/getUserById";
import { EditUserForm } from "./_components/EditUserForm";

export default async function EditUserPage({
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
  const user = await getUserById(id);

  if (!user) {
    notFound();
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <EditUserForm user={user} />
    </div>
  );
}

