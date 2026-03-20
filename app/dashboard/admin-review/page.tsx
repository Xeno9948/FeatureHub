import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { redirect } from "next/navigation";
import { AdminReviewList } from "@/components/dashboard/admin-review-list";

export default async function AdminReviewPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;

  if (user?.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Definitieve Beoordeling</h1>
        <p className="text-muted-foreground">Neem definitieve beslissingen over functieverzoeken.</p>
      </div>
      <AdminReviewList />
    </div>
  );
}
