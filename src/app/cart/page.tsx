"use client";

import CartDisplay from "@/components/Cart/CartDisplay";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useAppSelector } from "@/redux/hooks"; // Assuming you have useAppSelector
import { useRouter } from "next/navigation";
import { useEffect } from "react";
// Assuming you have NextAuth.js session for user ID
// import { useSession } from "next-auth/react";

export default function CartPage() {
  const router = useRouter();
  const userId = useAppSelector((state) => state.users.selectedUserId);

  useEffect(() => {
    if (!userId) {
      router.push("/login");
    }
  }, [userId, router]);

  if (!userId) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner />
        <p className="ml-2">Loading user session...</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-primary/10 p-8 min-h-screen">
      <CartDisplay userId={userId} />
    </div>
  );
}
