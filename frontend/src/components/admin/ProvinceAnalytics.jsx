import { useQuery } from "@tanstack/react-query";
import { getProvinceAnalytics } from "../../services/adminService";
import { PROVINCE_COLORS } from "../../constants/provinces";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function ProvinceAnalytics() {
  const { data: analytics, isLoading, error } = useQuery(
    ["provinceAnalytics"],
    getProvinceAnalytics
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading province analytics...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded">
        Error loading province analytics: {error.message}
      </div>
    );
  }

  if (!analytics || !analytics.provinces) {
    return (
      <div className="text-center py-8 text-gray-500">
        No province data available
      </div>
    );
  }

  const provinces = analytics.provinces;
  const labels = provinces.map(p => p.name);
  const emissionsData = provinces.map(p => p.totalEmissions);
  const offsetsData = provinces.map(p => p.totalOffsets);
  const userCounts = provinces.map(p => p.userCount);

  const emissionsChartData = {
    labels,
    datasets: [
      {
        label: "Total Emissions (tonnes CO2e)",
        data: emissionsData,
        backgroundColor: labels.map(province => PROVINCE_COLORS[province] || "#8884d8"),
        borderColor: labels.map(province => PROVINCE_COLORS[province] || "#8884d8"),
        borderWidth: 1,
      },
    ],
  };

  const offsetsChartData = {
    labels,
    datasets: [
      {
        label: "Total Offsets (tonnes CO2e)",
        data: offsetsData,
        backgroundColor: labels.map(province => PROVINCE_COLORS[province] || "#82ca9d"),
        borderColor: labels.map(province => PROVINCE_COLORS[province] || "#82ca9d"),
        borderWidth: 1,
      },
    ],
  };

  const userDistributionData = {
    labels,
    datasets: [
      {
        data: userCounts,
        backgroundColor: labels.map(province => PROVINCE_COLORS[province] || "#8884d8"),
        borderColor: "#fff",
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Province-wise Carbon Analytics",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Tonnes CO2e",
        },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom",
      },
      title: {
        display: true,
        text: "User Distribution by Province",
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Emissions</p>
              <p className="text-2xl font-semibold text-gray-900">
                {analytics.totalEmissions?.toFixed(2) || "0"} tonnes CO2e
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Offsets</p>
              <p className="text-2xl font-semibold text-gray-900">
                {analytics.totalOffsets?.toFixed(2) || "0"} tonnes CO2e
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Provinces</p>
              <p className="text-2xl font-semibold text-gray-900">
                {provinces.filter(p => p.userCount > 0).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Emissions by Province</h3>
          <Bar data={emissionsChartData} options={chartOptions} />
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Offsets by Province</h3>
          <Bar data={offsetsChartData} options={chartOptions} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">User Distribution</h3>
          <Doughnut data={userDistributionData} options={doughnutOptions} />
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Province Details</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {provinces.map((province) => (
              <div key={province.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div 
                    className="w-4 h-4 rounded-full mr-3"
                    style={{ backgroundColor: PROVINCE_COLORS[province.name] || "#8884d8" }}
                  ></div>
                  <span className="font-medium text-gray-900">{province.name}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">
                    {province.userCount} users
                  </div>
                  <div className="text-xs text-gray-500">
                    {province.totalEmissions?.toFixed(2) || "0"}t emissions
                  </div>
                  <div className="text-xs text-gray-500">
                    {province.totalOffsets?.toFixed(2) || "0"}t offsets
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

