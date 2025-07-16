import OrderList from '@/components/Orders/OrderList';

function OrdersPage() {
  return (
    <div className="w-full min-h-screen bg-primary/10 py-12">
      <OrderList mode="client" />
    </div>
  );
}

export default OrdersPage;
