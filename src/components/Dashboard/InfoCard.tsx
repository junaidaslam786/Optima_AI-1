// components/Dashboard/InfoCard.tsx
"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface InfoCardProps {
  title: string;
  body: string;
}

export function InfoCard({ title, body }: InfoCardProps) {
  return (
    <aside className="w-full bg-cyan-50 p-6 rounded-lg ml-6 mb-6">
      {/* Render the panel name as the card title */}
      <h2 className="text-xl font-medium text-gray-800 font-semibold mb-4">
        {title}
      </h2>
      <div className="prose prose-sm text-gray-700 space-y-4">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {body}
        </ReactMarkdown>
      </div>
    </aside>
  );
}
