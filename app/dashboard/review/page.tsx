import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { redirect } from "next/navigation";
import { SupportReviewList } from "@/components/dashboard/support-review-list";

export default async function ReviewPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;

  if (user?.role !== "SUPPORT") {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Beoordelingswachtrij</h1>
        <p className="text-muted-foreground">Beoordeel en verbeter ingediende functieverzoeken.</p>
      </div>
      <SupportReviewList />
    </div>
  );
}
