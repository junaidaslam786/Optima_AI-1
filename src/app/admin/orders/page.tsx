// app/admin/orders/page.tsx
"use client";

import OrderList from "@/components/Orders/OrderList";
import { withAuth } from "@/components/Auth/withAuth";

function AdminOrdersPage() {
  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <OrderList mode="admin" />
    </div>
  );
}

export default withAuth(AdminOrdersPage, { allowedRoles: ["admin"] });
