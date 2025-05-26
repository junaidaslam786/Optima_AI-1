import { TableRow } from "./TableRow";

interface Markers {
  id: string;
  code: string;
  normal_low: number;
  normal_high: number;
}

export function HormonesTable<HormonesTableProps>(markers: Markers[]) {
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
            marker={row.code}
            result={row.normal_high}
            range={row.normal_low + " - " + row.normal_high}
            status={row.normal_low}
          />
        ))}
      </tbody>
    </table>
  );
}
