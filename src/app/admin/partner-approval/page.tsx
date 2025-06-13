// app/admin/partner-approval/page.tsx
import PartnerApprovalList from "@/components/Admin/PartnerApprovalList";

export default function AdminPartnerApprovalPage() {
  return (
    <div className="w-full bg-secondary/10 p-8">
      <PartnerApprovalList />
    </div>
  );
}
