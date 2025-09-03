import Footer from "../../components/layout/Footer";
import VerificationPartners from "../../components/layout/VerificationPartners";
import PartnersScroller from "../../components/layout/PartnersScroller";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getUserCalculations } from "../../services/calculationService";
import { getOffsets } from "../../services/offsetService";
import StatsCard from "./StatsCard";
import UserTable from "./UserTable";
import EmissionsChart from "./EmissionsChart";

export default function UserDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [calculations, setCalculations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [offsets, setOffsets] = useState([]);

  useEffect(() => {
    const fetchUserCalculations = async () => {
      try {
        setIsLoading(true);
        if (user?.id) {
          const [data, offs] = await Promise.all([
            getUserCalculations(),
            getOffsets(),
          ]);
          setCalculations(data);
          setOffsets(offs || []);
        }
      } catch (err) {
        console.error("Error fetching calculations:", err);
        setError("Failed to load calculations");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserCalculations();
  }, [user]);

  const calculateStats = () => {
    if ((!calculations || calculations.length === 0) && (!offsets || offsets.length === 0)) {
      return {
        totalEmissions: 0,
        totalOffset: 0,
        netImpact: 0,
      };
    }

    const totalEmissions = calculations.reduce(
      (sum, calc) => sum + (calc.emissions || 0),
      0
    );
    const totalCalculatedOffset = calculations.reduce(
      (sum, calc) => sum + (calc.carbonOffset || 0),
      0
    );
    const totalRecordedOffset = offsets.reduce(
      (sum, o) => sum + (o.amount || 0),
      0
    );
    const totalOffset = totalCalculatedOffset + totalRecordedOffset;
    const netImpact = totalEmissions - totalOffset;

    return {
      totalEmissions: totalEmissions / 1000, // Convert to tonnes
      totalOffset: totalOffset / 1000, // Convert to tonnes
      netImpact: netImpact / 1000, // Convert to tonnes
    };
  };

  const stats = calculateStats();

  const handleNewCalculation = () => {
    navigate("/calculator");
  };

  const handleCalculateOffsets = () => {
    navigate("/offset");
  };

  const handleStartCalculating = () => {
    navigate("/calculator");
  };

  // Build history list combining calculations and recorded offsets
  const historyRows = (() => {
    const offsetRows = (offsets || []).map((o) => ({
      id: `offset-${o.id}`,
      type: o?.baselineCalculation?.type || "OFFSET",
      emissions: 0,
      carbonOffset: o.amount || 0,
      createdAt: o.createdAt,
    }));
    const rows = [...(calculations || []), ...offsetRows];
    return rows.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  })();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Carbon Footprint Dashboard
          </h1>
          <p className="text-gray-600">
            Welcome back, {user?.name || user?.email || "User"}! 
            {user?.province && (
              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                📍 {user.province}
              </span>
            )}
            Track your environmental impact.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatsCard
            title="TOTAL EMISSIONS"
            value={stats.totalEmissions.toFixed(2)}
            subtitle="Tonnes CO2e"
            icon={({ className }) => (
              <svg
                className={className}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
                />
              </svg>
            )}
            colorClass="text-red-600"
            trend={
              calculations.length > 1
                ? { value: "12%", isPositive: false }
                : null
            }
          />

          <StatsCard
            title="TOTAL OFFSET"
            value={stats.totalOffset.toFixed(2)}
            subtitle="Tonnes CO2e"
            icon={({ className }) => (
              <svg
                className={className}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M7 11l5-5m0 0l5 5m-5-5v12"
                />
              </svg>
            )}
            colorClass="text-green-600"
            trend={
              calculations.length > 1 ? { value: "8%", isPositive: true } : null
            }
          />

          <StatsCard
            title="NET IMPACT"
            value={stats.netImpact.toFixed(2)}
            subtitle="Tonnes CO2e"
            icon={({ className }) => (
              <svg
                className={className}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            )}
            colorClass={stats.netImpact > 0 ? "text-red-600" : "text-green-600"}
            trend={
              calculations.length > 1
                ? { value: "5%", isPositive: stats.netImpact < 0 }
                : null
            }
          />
        </div>

        {/* Calculation History Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Calculation History
              </h2>
              <p className="text-gray-600 text-sm">
                Track all your carbon footprint calculations
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <button
                onClick={handleNewCalculation}
                className="bg-green-600 hover:bg-green-700 text-white px-5 sm:px-6 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                New Calculation
              </button>
              <button
                onClick={handleCalculateOffsets}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 sm:px-6 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                Calculate Offsets
              </button>
            </div>
          </div>

          <UserTable calculations={historyRows} isLoading={isLoading} />
        </div>

        {/* Emissions Chart */}
        {calculations && calculations.length > 0 && (
          <div className="mb-8">
            <EmissionsChart calculations={calculations} offsets={offsets} />
          </div>
        )}

        {/* Empty State for New Users */}
        {!isLoading && (!calculations || calculations.length === 0) && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="mx-auto h-16 w-16 text-gray-400 mb-4">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              No calculations yet
            </h3>
            <p className="text-gray-500 mb-6">
              Get started by using our carbon calculator to track your
              environmental impact.
            </p>
            <button
              onClick={handleStartCalculating}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 inline-flex items-center gap-2"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
              Start Calculating
            </button>
          </div>
        )}
      </div>
      <VerificationPartners />
      <Footer />
      {/* <PartnersScroller /> */}
    </div>
  );
}
