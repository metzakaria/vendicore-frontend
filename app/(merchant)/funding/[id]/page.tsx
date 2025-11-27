import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getMerchantFundingById } from "../_actions/getMerchantFundingById";
import { MerchantFundingDetails } from "./_components/MerchantFundingDetails";

export default async function MerchantFundingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const userRole = session.user.role?.toLowerCase();
  if (userRole !== "merchant") {
    redirect("/login");
  }

  const { id } = await params;
  const funding = await getMerchantFundingById(id);

  if (!funding) {
    notFound();
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <MerchantFundingDetails funding={funding} />
    </div>
  );
}

