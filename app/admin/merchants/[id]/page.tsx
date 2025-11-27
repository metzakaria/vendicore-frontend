import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getMerchantById } from "./_actions/getMerchantById";
import { MerchantDetails } from "./_components/MerchantDetails";

export default async function MerchantDetailPage({
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
  console.log("MerchantDetailPage - Received ID:", id);
  
  const merchant = await getMerchantById(id);

  if (!merchant) {
    notFound();
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <MerchantDetails merchant={merchant} />
    </div>
  );
}

