import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getFundingRequestById } from "../../_actions/getFundingRequestById";
import { EditFundingForm } from "./_components/EditFundingForm";

export default async function EditFundingPage({
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
      <EditFundingForm funding={funding} />
    </div>
  );
}
