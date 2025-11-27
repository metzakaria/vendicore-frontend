import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getMerchantById } from "../_actions/getMerchantById";
import { EditMerchantForm } from "./_components/EditMerchantForm";

export default async function EditMerchantPage({
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
  const merchant = await getMerchantById(id);

  if (!merchant) {
    notFound();
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Edit Merchant</h2>
          <p className="text-muted-foreground">
            Update merchant information
          </p>
        </div>
      </div>

      <EditMerchantForm merchant={merchant} />
    </div>
  );
}

