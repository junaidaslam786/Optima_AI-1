import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import ClientDashboard from "@/components/Dashboard/ClientDashboard";
import { authOptions } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/auth/signin");
  }

  return <ClientDashboard userId={session.user.id} />;
}
