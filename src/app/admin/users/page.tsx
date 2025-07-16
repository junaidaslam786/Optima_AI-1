import UserList from "@/components/Admin/Users/UserList";
import React from "react";

export default function AdminUsersPage() {
  return (
    <div className="w-full bg-primary/10 p-8 min-h-screen">
      <UserList />
    </div>
  );
}
