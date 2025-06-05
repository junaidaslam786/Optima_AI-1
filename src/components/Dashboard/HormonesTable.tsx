// components/Dashboard/HormonesTable.tsx
import { TableRow } from "./TableRow";

interface Marker {
  id: string;
  value: number;
  normal_low: number | null;
  normal_high: number | null;
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
      <thead className="bg-primary/20">
        <tr>
          <th className="px-4 py-2 text-left text-primary">Marker</th>
          <th className="px-4 py-2 text-left text-primary">Result</th>
          <th className="px-4 py-2 text-left text-primary">Reference Range</th>
          <th className="px-4 py-2 text-left text-primary">Status</th>
        </tr>
      </thead>
      <tbody>
        {markers.map((row) => {
          let range: string;
          const low = row.normal_low;
          const high = row.normal_high;

          if (low == null && high != null) {
            range = `<${high}`;
          } else if (low != null && high == null) {
            range = `${low}<`;
          } else if (low != null && high != null) {
            range = `${low} - ${high}`;
          } else {
            range = "-";
          }

          return (
            <TableRow
              key={row.id}
              marker={row.marker}
              result={`${row.value} ${row.unit}`}
              range={range}
              status={row.status}
            />
          );
        })}
      </tbody>
    </table>
  );
}
