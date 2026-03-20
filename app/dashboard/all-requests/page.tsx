import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { redirect } from "next/navigation";
import { AllRequestsList } from "@/components/dashboard/all-requests-list";

export default async function AllRequestsPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;

  if (user?.role !== "SUPPORT" && user?.role !== "ADMIN" && user?.role !== "VIEWER") {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-6">
      <AllRequestsList />
    </div>
  );
}
