import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getDataPackageById } from "../_actions/getDataPackageById";
import { DataPackageDetails } from "./_components/DataPackageDetails";

export default async function DataPackagePage({
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
  const dataPackage = await getDataPackageById(id);

  if (!dataPackage) {
    notFound();
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <DataPackageDetails dataPackage={dataPackage} />
    </div>
  );
}

