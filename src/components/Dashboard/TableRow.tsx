import { StatusBadge } from "./StatusBadge";

interface TableRowProps {
  marker: string;
  result: string;
  range: string;
  status: string;
}
export function TableRow({ marker, result, range, status }: TableRowProps) {
  return (
    <tr className="odd:bg-white even:bg-gray-50">
      <td className="px-4 py-2 text-blue-800">{marker}</td>
      <td className="px-4 py-2 text-gray-800 font-semibold">{result}</td>
      <td className="px-4 py-2 text-gray-600">{range}</td>
      <td className="px-4 py-2">
        <StatusBadge status={status} />
      </td>
    </tr>
  );
}
