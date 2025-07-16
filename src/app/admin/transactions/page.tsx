import TransactionList from "@/components/Admin/Settings/TransactionList";
import React from "react";

export default function AdminTransactionsPage() {
  return (
    <div className="w-full bg-primary/10 p-8 min-h-screen">
      <TransactionList />
    </div>
  );
}