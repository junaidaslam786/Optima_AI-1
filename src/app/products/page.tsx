// app/products/page.tsx
import PartnerProductList from "@/components/Client/ProductList";

export default function AllPartnerProductsPage() {
  return (
    <div className="w-full bg-primary/10 p-8">
      <PartnerProductList />
    </div>
  );
}
