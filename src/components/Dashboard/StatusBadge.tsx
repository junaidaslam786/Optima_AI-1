interface StatusBadgeProps {
  status: string;
}
export function StatusBadge({ status }: StatusBadgeProps) {
  const colorClass =
    status.toLowerCase() === "normal"
      ? "bg-green-100 text-green-800"
      : "bg-red-100 text-red-800";
  return (
    <span
      className={`px-2 py-0.5 text-sm font-medium rounded-full ${colorClass}`}
    >
      {status}
    </span>
  );
}
