// components/Dashboard/InfoCard.tsx
"use client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function InfoCard({ body }: { body: string }) {
  return (
    <aside className="w-full md:w-1/3 bg-cyan-50 p-6 rounded-lg ml-6">
      {/* render markdown rather than raw text */}
      <div className="prose prose-sm text-gray-700">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{body}</ReactMarkdown>
      </div>
    </aside>
  );
}
