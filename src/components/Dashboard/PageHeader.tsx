export function PageHeader() {
  return (
    <div className="flex justify-between items-center mt-6 mb-4">
      <h1 className="text-xl font-semibold text-gray-800">
        Healthy Male Profile
      </h1>
      <div className="text-right">
        <div className="inline-block bg-blue-100 text-blue-900 px-3 py-1 rounded-full text-sm">
          Apr 12, 2024
        </div>
        <p className="text-xs text-gray-500 mt-1">Reviewed</p>
      </div>
    </div>
  );
}
