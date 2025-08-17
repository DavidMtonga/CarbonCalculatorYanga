import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function EmissionsChart({ calculations }) {
  if (!calculations || calculations.length === 0) {
    return (
      <div className="text-center py-8">No calculation data available</div>
    );
  }

  const dataByType = calculations.reduce((acc, calc) => {
    acc[calc.type] = (acc[calc.type] || 0) + calc.emissions;
    return acc;
  }, {});

  const chartData = {
    labels: Object.keys(dataByType),
    datasets: [
      {
        data: Object.values(dataByType),
        backgroundColor: [
          "#28a745", // personal
          "#007bff", // construction
          "#6f42c1", // manufacturing
          "#e83e8c", // cooking
          "#fd7e14", // brazier
          "#20c997", // afforestation
          "#17a2b8", // water
          "#ffc107", // agriculture
        ],
      },
    ],
  };

  return (
    <div className="bg-white p-2 rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-4">Emissions by Category</h2>
      <div className="max-w-md mx-auto">
        <Pie data={chartData} />
      </div>
    </div>
  );
}
