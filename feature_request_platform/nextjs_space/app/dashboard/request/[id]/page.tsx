import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { redirect } from "next/navigation";
import { RequestDetail } from "@/components/dashboard/request-detail";

interface RequestDetailPageProps {
  params: { id: string };
}

export default async function RequestDetailPage({ params }: RequestDetailPageProps) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return <RequestDetail requestId={params.id} />;
}
