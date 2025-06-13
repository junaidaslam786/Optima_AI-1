// app/admin/products/page.tsx
import AdminProductManager from '@/components/Admin/AdminProductManager';

export default function AdminProductsPage() {
  return (
    <div className="w-full bg-secondary/10 p-8">
      <AdminProductManager />
    </div>
  );
}