export function InfoCard({ title, body }: { title: string; body: string }) {
  return (
    <aside className="w-full md:w-1/3 bg-cyan-50 p-6 rounded-lg ml-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">{title}</h2>
      <p className="text-gray-700 whitespace-pre-line">{body}</p>
    </aside>
  );
}
