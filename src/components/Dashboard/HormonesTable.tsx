import { TableRow } from "./TableRow";

interface Marker {
  id: string;
  value: number;
  normal_low: number;
  normal_high: number;
  unit: string;
  marker: string;
  status: string;
}

interface HormonesTableProps {
  markers: Marker[];
}

export function HormonesTable({ markers }: HormonesTableProps) {
  return (
    <table className="w-full border-collapse rounded-lg overflow-hidden">
      <thead className="bg-cyan-100">
        <tr>
          <th className="px-4 py-2 text-left text-gray-700">Marker</th>
          <th className="px-4 py-2 text-left text-gray-700">Result</th>
          <th className="px-4 py-2 text-left text-gray-700">Reference Range</th>
          <th className="px-4 py-2 text-left text-gray-700">Status</th>
        </tr>
      </thead>
      <tbody>
        {markers.map((row) => (
          <TableRow
            key={row.id}
            marker={row.marker}
            result={`${row.normal_high} (${row.unit})`}
            range={row.normal_low + " - " + row.normal_high}
            status={row.status}
          />
        ))}
      </tbody>
    </table>
  );
}
