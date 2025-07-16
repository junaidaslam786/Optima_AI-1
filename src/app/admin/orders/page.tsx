import OrderList from "@/components/Orders/OrderList";

function AdminOrdersPage() {
  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <OrderList mode="admin" />
    </div>
  );
}

export default AdminOrdersPage;
