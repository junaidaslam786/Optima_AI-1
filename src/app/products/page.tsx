// app/products/page.tsx
import PartnerProductList from "@/components/Client/ProductList";

export default function AllPartnerProductsPage() {
  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <PartnerProductList />
    </div>
  );
}
