import { useQuery } from "@tanstack/react-query";
import { getAllCalculations } from "../../services/adminService";

export default function AdminCalculationsTable({ selectedProvince = "" }) {
  const { data: calculations, isLoading } = useQuery(
    ["adminCalculations"],
    getAllCalculations,
    {
      refetchInterval: 15000,
      refetchOnWindowFocus: true,
    }
  );

  if (isLoading) return <div>Loading calculations...</div>;

  const filtered = selectedProvince
    ? (calculations || []).filter((c) => c?.user?.province === selectedProvince)
    : calculations;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-3 sm:px-4 md:px-6 py-3 text-left font-medium text-gray-600 uppercase tracking-wider text-xs">User</th>
            <th className="px-3 sm:px-4 md:px-6 py-3 text-left font-medium text-gray-600 uppercase tracking-wider text-xs">Province</th>
            <th className="px-3 sm:px-4 md:px-6 py-3 text-left font-medium text-gray-600 uppercase tracking-wider text-xs">Type</th>
            <th className="px-3 sm:px-4 md:px-6 py-3 text-left font-medium text-gray-600 uppercase tracking-wider text-xs">Emissions (kg)</th>
            <th className="px-3 sm:px-4 md:px-6 py-3 text-left font-medium text-gray-600 uppercase tracking-wider text-xs">Calc Offset (kg)</th>
            <th className="px-3 sm:px-4 md:px-6 py-3 text-left font-medium text-gray-600 uppercase tracking-wider text-xs">Recorded Offsets (kg)</th>
            <th className="px-3 sm:px-4 md:px-6 py-3 text-left font-medium text-gray-600 uppercase tracking-wider text-xs">Total Offset (kg)</th>
            <th className="px-3 sm:px-4 md:px-6 py-3 text-left font-medium text-gray-600 uppercase tracking-wider text-xs">Date</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filtered?.map((calc) => (
            <tr key={calc.id} className="hover:bg-gray-50">
              <td className="px-3 sm:px-4 md:px-6 py-3 whitespace-nowrap">
                <div className="font-medium truncate max-w-[12rem] sm:max-w-[16rem]">{calc.user.name}</div>
                <div className="text-xs text-gray-500 truncate max-w-[12rem] sm:max-w-[16rem]">{calc.user.email}</div>
              </td>
              <td className="px-3 sm:px-4 md:px-6 py-3 whitespace-nowrap">
                <span className="text-xs sm:text-sm">{calc.user.province || "—"}</span>
              </td>
              <td className="px-3 sm:px-4 md:px-6 py-3 whitespace-nowrap">
                <span className="capitalize">{calc.type.toLowerCase()}</span>
              </td>
              <td className="px-3 sm:px-4 md:px-6 py-3 whitespace-nowrap">{Number(calc.emissions).toFixed(2)}</td>
              <td className="px-3 sm:px-4 md:px-6 py-3 whitespace-nowrap">{Number(calc.carbonOffset || 0).toFixed(2)}</td>
              <td className="px-3 sm:px-4 md:px-6 py-3 whitespace-nowrap">{Number(calc.recordedOffset || 0).toFixed(2)}</td>
              <td className="px-3 sm:px-4 md:px-6 py-3 whitespace-nowrap font-semibold">{Number(calc.totalOffset || (calc.carbonOffset || 0)).toFixed(2)}</td>
              <td className="px-3 sm:px-4 md:px-6 py-3 whitespace-nowrap">{new Date(calc.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
