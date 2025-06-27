"use client";
import { useSession } from "next-auth/react";

export function PageHeader() {
  const { data: session } = useSession();

  return (
    <div className="flex justify-between items-center mt-6 mb-4">
      <h1 className="text-xl font-semibold text-gray-800">
        {session?.user.name}&apos;s Test Results
      </h1>
    </div>
  );
}
