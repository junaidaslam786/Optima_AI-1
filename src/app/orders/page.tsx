// app/orders/page.tsx
'use client';

import OrderList from '@/components/Orders/OrderList';
import { useSession } from 'next-auth/react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { withAuth } from '@/components/Auth/withAuth';

function OrdersPage() {
  const { data: session, status } = useSession();
  const user = session?.user;
  const sessionLoading = status === 'loading';

  if (sessionLoading) {
    return <div className="flex justify-center items-center h-screen"><LoadingSpinner /><p className="ml-2">Loading user data...</p></div>;
  }

  if (!user) {
    return null; // withAuth will redirect if not authenticated
  }

  return (
    <div className="w-full min-h-screen bg-primary/10 py-12">
      <OrderList mode="customer" filterByUserId={user.id} />
    </div>
  );
}

export default withAuth(OrdersPage);