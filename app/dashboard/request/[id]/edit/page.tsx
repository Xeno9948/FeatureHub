import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { redirect } from "next/navigation";
import { EditRequestForm } from "@/components/dashboard/edit-request-form";

interface EditRequestPageProps {
  params: { id: string };
}

export default async function EditRequestPage({ params }: EditRequestPageProps) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return <EditRequestForm requestId={params.id} />;
}
