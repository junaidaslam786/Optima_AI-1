import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import ClientDashboard from "@/components/Dashboard/ClientDashboard";
import { authOptions } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/auth/signin");
  }

  return (
    <div className="w-full min-h-screen bg-primary/10 p-12">
      <ClientDashboard userId={session.user.id} />
    </div>
  );
}
