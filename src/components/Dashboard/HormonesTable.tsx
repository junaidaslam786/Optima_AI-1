import { TableRow } from "./TableRow";

const data = [
  {
    marker: "Total Testosterone",
    result: "580 ng/dL",
    range: "300 - 950",
    status: "Normal",
  },
  { marker: "SHBG", result: "38 nmol/L", range: "10 - 57", status: "Normal" },
  {
    marker: "Free Testosterone",
    result: "17.3 pg/mL",
    range: "70 - 230",
    status: "Normal",
  },
];

export function HormonesTable() {
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
        {data.map((row) => (
          <TableRow
            key={row.marker}
            marker={row.marker}
            result={row.result}
            range={row.range}
            status={row.status}
          />
        ))}
      </tbody>
    </table>
  );
}
