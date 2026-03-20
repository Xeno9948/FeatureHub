import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { redirect } from "next/navigation";
import { NewRequestForm } from "@/components/dashboard/new-request-form";

export default async function NewRequestPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;

  if (user?.role !== "USER") {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Nieuw Functieverzoek Indienen</h1>
        <p className="text-muted-foreground">Beschrijf de functie die u graag zou zien in het KV-platform.</p>
      </div>
      <NewRequestForm />
    </div>
  );
}
