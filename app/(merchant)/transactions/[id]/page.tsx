import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getMerchantTransactionById } from "../_actions/getMerchantTransactionById";
import { MerchantTransactionDetails } from "./_components/MerchantTransactionDetails";

export default async function MerchantTransactionPage({
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
  const transaction = await getMerchantTransactionById(id);

  if (!transaction) {
    notFound();
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <MerchantTransactionDetails transaction={transaction} />
    </div>
  );
}

