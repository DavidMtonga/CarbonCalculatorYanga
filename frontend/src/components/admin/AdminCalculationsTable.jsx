import { useQuery } from "@tanstack/react-query";
import { getAllCalculations } from "../../services/adminService";

export default function AdminCalculationsTable() {
  const { data: calculations, isLoading } = useQuery(
    ["adminCalculations"],
    getAllCalculations
  );

  if (isLoading) return <div>Loading calculations...</div>;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              User
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Type
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Emissions (kg)
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Offset (kg)
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {calculations?.map((calc) => (
            <tr key={calc.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="font-medium">{calc.user.name}</div>
                <div className="text-sm text-gray-500">{calc.user.email}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="capitalize">{calc.type.toLowerCase()}</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {calc.emissions.toFixed(2)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {calc.carbonOffset.toFixed(2)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {new Date(calc.createdAt).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
