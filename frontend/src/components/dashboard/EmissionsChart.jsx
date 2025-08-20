import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function EmissionsChart({ calculations, offsets = [] }) {
  if (!calculations || calculations.length === 0) {
    return <div className="text-center py-8">No calculation data available</div>;
  }

  const totalEmissions = calculations.reduce(
    (sum, c) => sum + (c.emissions || 0),
    0
  );
  const totalOffsetFromCalcs = calculations.reduce(
    (sum, c) => sum + (c.carbonOffset || 0),
    0
  );
  const totalOffsetFromRecords = offsets.reduce(
    (sum, o) => sum + (o.amount || 0),
    0
  );
  const totalOffsets = totalOffsetFromCalcs + totalOffsetFromRecords;

  const chartData = {
    labels: ["Emissions", "Offsets"],
    datasets: [
      {
        data: [totalEmissions, totalOffsets],
        backgroundColor: ["#ef4444", "#10b981"],
      },
    ],
  };

  const options = {
    plugins: {
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const values = ctx.dataset.data;
            const total = values.reduce((s, v) => s + v, 0) || 1;
            const value = ctx.parsed;
            const pct = ((value / total) * 100).toFixed(1);
            return `${ctx.label}: ${value.toFixed(1)} kg (${pct}%)`;
          },
        },
      },
      legend: { position: "bottom" },
    },
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-4 text-center">Emissions vs Offsets</h2>
      <div className="max-w-md mx-auto">
        <Pie data={chartData} options={options} />
      </div>
    </div>
  );
}
