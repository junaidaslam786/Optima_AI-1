'use client';

import OrderList from '@/components/Orders/OrderList';
import { useAppSelector } from '@/redux/hooks'; // Use useAppSelector for userId
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

function OrdersPage() {
  const router = useRouter();
  // Get the authenticated user's ID. Replace with your actual auth logic.
  // For example, if using NextAuth.js:
  // const { data: session, status } = useSession();
  // const userId = session?.user?.id;
  // const isLoadingSession = status === 'loading';

  // For demonstration, using a dummy userId from Redux state (replace with real auth)
  const userId = useAppSelector((state) => state.users.selectedUserId);

  useEffect(() => {
    // Redirect if user is not logged in
    if (!userId) {
      router.push("/login"); // Redirect to login page if no user
    }
  }, [userId, router]);

  if (!userId) {
    // Or if (isLoadingSession)
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner />
        <p className="ml-2">Loading user data...</p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-primary/10 py-12">
      <OrderList mode="customer" filterByUserId={userId} />
    </div>
  );
}

export default OrdersPage; // Removed withAuth as it's now handled by client-side check and router.push
