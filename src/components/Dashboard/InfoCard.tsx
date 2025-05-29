// components/Dashboard/InfoCard.tsx
"use client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function InfoCard({ body }: { body: string }) {
  return (
    <aside className="w-full md:w-1/3 bg-cyan-50 p-6 rounded-lg ml-6">
      {/* render markdown rather than raw text */}
      <div className="prose prose-sm text-gray-700 space-y-4">
        <h2 className="text-xl font-medium text-gray-800 font-semibold">
          Insights from Optima.AI
        </h2>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{body}</ReactMarkdown>
      </div>
    </aside>
  );
}
