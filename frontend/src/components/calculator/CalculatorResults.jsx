import React from "react";
import { useNavigate } from "react-router-dom";
import { saveCalculation } from "../../services/calculationService";

const CalculatorResults = ({
  results,
  activeTab,
  onBack,
  onSave,
  saveSuccess,
}) => {
  const navigate = useNavigate();

  if (!results) return null;

  const isOffset = ["afforestation", "water"].includes(activeTab);
  const totalKg = results.total;
  const totalTonnes = Math.abs(totalKg / 1000).toFixed(2);
  const dailyAverage = Math.abs(totalKg / 30).toFixed(1);

  const getColor = (tab) => {
    switch (tab) {
      case "cooking":
        return "bg-pink-600";
      default:
        return "bg-gray-600";
    }
  };

  const getEmissionCategoryName = (key) => {
    const categoryNames = {
      "Fuel Consumption": "Fuel Consumption",
      "Charcoal Emissions (VERRA)": "Charcoal Emissions (VERRA Methodology)",
      "Meal Preparation": "Meal Preparation",
      "Cooking Duration Impact": "Cooking Duration Impact",
    };
    return categoryNames[key] || key;
  };

  const getEmissionDescription = (key) => {
    const descriptions = {
      "Fuel Consumption": "Emissions from fuel used during cooking activities",
      "Charcoal Emissions (VERRA)":
        "Charcoal emissions calculated using VERRA methodology standards",
      "Meal Preparation":
        "Emissions from meal preparation and food processing activities",
      "Cooking Duration Impact":
        "Additional emissions based on extended cooking time and energy usage",
    };
    return descriptions[key] || "";
  };

  const handleSave = async () => {
    try {
      const payload = {
        type: activeTab.toUpperCase(),
        emissions: totalKg > 0 ? totalKg : 0,
        carbonOffset: isOffset ? Math.abs(totalKg) : 0,
        data: {
          fuelType: results.fuelType || "unknown",
          cookingDuration: results.cookingDuration || 0,
          cookingMeals: results.cookingMeals || 0,
          charcoalUsed: results.charcoalUsed || 0,
        },
      };

      await saveCalculation(payload);
      if (onSave) onSave();
    } catch (error) {
      console.error("Error saving calculation:", error);
      alert(`Failed to save calculation: ${error.message}`);
    }
  };

  const handleNavigateToOffset = () => {
    navigate("/offset");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Emissions
            Summary
          </h2>
          <p className="text-gray-600 mt-1">
            Monthly carbon footprint calculation results
          </p>
        </div>
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
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
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Calculator
        </button>
      </div>

      {/* Success Message */}
      {saveSuccess && (
        <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg">
          <div className="flex items-center gap-2">
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
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span className="font-medium">Calculation saved successfully!</span>
          </div>
        </div>
      )}

      {/* Visual Emissions Chart */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
          Carbon Footprint Visualization
        </h3>
        <div className="flex justify-center items-end h-48 gap-8 mb-4">
          <div className="text-center">
            <div
              className="w-20 bg-gradient-to-t from-red-600 to-red-400 rounded-t-lg relative transition-all duration-1000 mx-auto shadow-lg"
              style={{
                height: isOffset
                  ? "0px"
                  : `${Math.min(160, (totalKg / 200) * 160)}px`,
              }}
            >
              <div className="absolute -top-10 left-0 right-0 text-center">
                <div className="bg-red-600 text-white text-sm font-bold py-1 px-2 rounded shadow">
                  {totalKg.toFixed(1)} kg
                </div>
              </div>
            </div>
            <div className="mt-4 text-sm font-semibold text-red-700">
              Monthly Emissions
            </div>
            <div className="text-xs text-gray-500">CO₂e Generated</div>
          </div>

          <div className="text-center">
            <div
              className="w-20 bg-gradient-to-t from-green-600 to-green-400 rounded-t-lg relative transition-all duration-1000 mx-auto shadow-lg"
              style={{
                height: isOffset
                  ? `${Math.min(160, (Math.abs(totalKg) / 200) * 160)}px`
                  : "0px",
              }}
            >
              <div className="absolute -top-10 left-0 right-0 text-center">
                <div className="bg-green-600 text-white text-sm font-bold py-1 px-2 rounded shadow">
                  {isOffset ? Math.abs(totalKg).toFixed(1) : "0.0"} kg
                </div>
              </div>
            </div>
            <div className="mt-4 text-sm font-semibold text-green-700">
              Carbon Offset
            </div>
            <div className="text-xs text-gray-500">CO₂e Reduced</div>
          </div>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-md">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">
            Detailed Emission Breakdown
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Analysis of each emission source contributing to your carbon
            footprint
          </p>
        </div>

        <div className="p-6 space-y-6">
          {Object.entries(results).map(
            ([key, value]) =>
              key !== "total" && (
                <div
                  key={key}
                  className="border border-gray-100 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800 text-lg">
                        {getEmissionCategoryName(key)}
                      </h4>
                      {getEmissionDescription(key) && (
                        <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                          {getEmissionDescription(key)}
                        </p>
                      )}
                    </div>
                    <div className="text-right ml-4">
                      <div className="font-bold text-xl text-gray-900">
                        {value.toFixed(1)}{" "}
                        <span className="text-sm font-normal text-gray-500">
                          kg CO₂e
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {((Math.abs(value) / Math.abs(totalKg)) * 100).toFixed(
                          1
                        )}
                        % of total
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-3 rounded-full ${getColor(
                        activeTab
                      )} transition-all duration-1000`}
                      style={{
                        width: `${Math.min(
                          100,
                          (Math.abs(value) / Math.abs(totalKg)) * 100
                        )}%`,
                      }}
                    ></div>
                  </div>
                </div>
              )
          )}
        </div>
      </div>

      {/* Summary Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-200 rounded-lg p-6 text-center">
          <div className="text-3xl font-bold text-red-700 mb-2">
            {totalTonnes}
          </div>
          <div className="text-sm text-red-700 font-semibold mb-1">
            Tonnes CO₂e/month
          </div>
          <div className="text-xs text-red-600">
            Total Monthly Carbon Emissions
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200 rounded-lg p-6 text-center">
          <div className="text-3xl font-bold text-orange-700 mb-2">
            {dailyAverage}
          </div>
          <div className="text-sm text-orange-700 font-semibold mb-1">
            kg CO₂e/day
          </div>
          <div className="text-xs text-orange-600">Daily Average Impact</div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-lg p-6 text-center">
          <div className="text-3xl font-bold text-blue-700 mb-2">
            {((totalKg * 12) / 1000).toFixed(1)}
          </div>
          <div className="text-sm text-blue-700 font-semibold mb-1">
            Tonnes CO₂e/year
          </div>
          <div className="text-xs text-blue-600">Annual Projection</div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={handleSave}
          className="flex-1 py-4 px-6 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
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
              d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
            />
          </svg>
          Save Calculation
        </button>

        <button
          onClick={handleNavigateToOffset}
          className="flex-1 py-4 px-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
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
              d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
            />
          </svg>
          Offset Emissions
        </button>
      </div>
    </div>
  );
};

export default CalculatorResults;
