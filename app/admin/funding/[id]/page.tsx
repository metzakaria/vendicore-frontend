import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getFundingRequestById } from "../_actions/getFundingRequestById";
import { FundingDetails } from "./_components/FundingDetails";

export default async function FundingPage({
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
  const funding = await getFundingRequestById(id);

  if (!funding) {
    notFound();
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <FundingDetails funding={funding} />
    </div>
  );
}

