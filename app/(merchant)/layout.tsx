import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { MerchantSidebar } from "./_components/MerchantSidebar";
import { MerchantHeader } from "./_components/MerchantHeader";

export default async function MerchantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const userRole = session.user.role?.toLowerCase();
  if (userRole !== "merchant") {
    redirect("/login");
  }

  return (
    <div className="flex h-screen flex-col lg:flex-row overflow-hidden">
      <MerchantSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <MerchantHeader />
        <main className="flex-1 overflow-y-auto bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}