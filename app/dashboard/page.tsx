import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { DashboardContent } from "@/components/dashboard/dashboard-content";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;

  return <DashboardContent role={user?.role} userId={user?.id} />;
}
