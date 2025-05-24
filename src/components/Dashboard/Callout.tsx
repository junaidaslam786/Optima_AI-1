export function Callout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start bg-yellow-50 border-l-4 border-yellow-300 p-4 rounded-md my-4">
      <svg
        className="w-6 h-6 text-yellow-400 flex-shrink-0 mr-3"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11H9v4h2V7zm0 6H9v2h2v-2z" />
      </svg>
      <p className="text-sm text-gray-700">{children}</p>
    </div>
  );
}
