import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import Header from "../components/layout/Header";
import Card from "../components/ui/Card";
import AdminUsersTable from "../components/admin/AdminUsersTable";
import AdminCalculationsTable from "../components/admin/AdminCalculationsTable";
import { getAdminStats, exportCalculations } from "../services/adminService";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("users");
  const { data: stats, isLoading } = useQuery(["adminStats"], getAdminStats);

  const handleExport = async () => {
    try {
      const data = await exportCalculations();
      const blob = new Blob([data], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "carbon_calculations.csv";
      a.click();
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  if (isLoading)
    return <div className="text-center py-8">Loading admin data...</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card title="Total Users" value={stats?.totalUsers || 0} />
          <Card title="Active Users" value={stats?.activeUsers || 0} />
          <Card
            title="Total Emissions"
            value={`${stats?.totalEmissions?.toFixed(2) || 0} kg`}
          />
          <Card
            title="Total Offset"
            value={`${stats?.totalOffset?.toFixed(2) || 0} kg`}
          />
        </div>

        {/* Tabs */}
        <div className="flex border-b mb-4">
          <button
            className={`px-4 py-2 ${
              activeTab === "users"
                ? "border-b-2 border-green-600 font-semibold"
                : ""
            }`}
            onClick={() => setActiveTab("users")}
          >
            Users
          </button>
          <button
            className={`px-4 py-2 ${
              activeTab === "calculations"
                ? "border-b-2 border-green-600 font-semibold"
                : ""
            }`}
            onClick={() => setActiveTab("calculations")}
          >
            Calculations
          </button>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow p-4">
          {activeTab === "users" ? (
            <AdminUsersTable />
          ) : (
            <div>
              <div className="flex justify-end mb-4">
                <button
                  onClick={handleExport}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Export to CSV
                </button>
              </div>
              <AdminCalculationsTable />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
