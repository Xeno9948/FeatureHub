import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { redirect } from "next/navigation";
import { CategoriesManager } from "@/components/dashboard/categories-manager";

export default async function CategoriesPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;

  if (user?.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Categorieën Beheren</h1>
        <p className="text-muted-foreground">Maak en beheer categorieën voor functieverzoeken.</p>
      </div>
      <CategoriesManager />
    </div>
  );
}
