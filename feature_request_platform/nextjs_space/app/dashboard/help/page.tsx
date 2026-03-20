import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { redirect } from "next/navigation";
import { HelpContent } from "@/components/dashboard/help-content";

export default async function HelpPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return <HelpContent userRole={(session.user as any)?.role || "USER"} />;
}
