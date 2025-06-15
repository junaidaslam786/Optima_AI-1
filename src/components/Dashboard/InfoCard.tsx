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
    <aside className="w-full bg-primary/10 p-6 rounded-lg ml-6 mb-6">
      <h2 className="text-xl font-medium text-primary mb-4">{title}</h2>
      <div className="prose prose-secondary space-y-4 text-secondary">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {body}
        </ReactMarkdown>
      </div>
    </aside>
  );
}
