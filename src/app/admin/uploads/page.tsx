import UploadList from "@/components/Admin/Uploads/UploadList";
import React from "react";

export default function AdminUploadsPage() {
  return (
    <div className="w-full bg-primary/10 p-8 min-h-screen">
      <UploadList />
    </div>
  );
}