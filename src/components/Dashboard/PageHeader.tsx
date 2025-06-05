"use client";
import { useSession } from "next-auth/react";

export function PageHeader() {
  const {data: session} = useSession();
  const currentDate = new Date().toLocaleDateString("en-UK", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });

  return (
    <div className="flex justify-between items-center mt-6 mb-4">
      <h1 className="text-xl font-semibold text-gray-800">
        {session?.user.name}'s Test Results
      </h1>
      <div className="text-right">
        <div className="inline-block bg-blue-100 text-blue-900 px-3 py-1 rounded-full text-sm">
          {currentDate}
        </div>
        <p className="text-xs text-gray-500 mt-1">Reviewed</p>
      </div>
    </div>
  );
}
