import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { redirect } from "next/navigation";
import { MyRequestsList } from "@/components/dashboard/my-requests-list";

export default async function MyRequestsPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;

  if (user?.role !== "USER") {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Mijn Verzoeken</h1>
        <p className="text-muted-foreground">Volg de status van uw ingediende functieverzoeken.</p>
      </div>
      <MyRequestsList />
    </div>
  );
}
