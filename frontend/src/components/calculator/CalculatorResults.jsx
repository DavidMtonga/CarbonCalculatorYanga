import React from "react";
import { saveCalculation } from "../../services/calculationService";

const CalculatorResults = ({ results, activeTab, onBack, onSave }) => {
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
      "Fuel Consumption": "Emissions from fuel used during cooking",
      "Charcoal Emissions (VERRA)":
        "Charcoal emissions calculated using VERRA methodology",
      "Meal Preparation": "Emissions from meal preparation activities",
      "Cooking Duration Impact": "Additional emissions based on cooking time",
    };
    return descriptions[key] || "";
  };

  const handleSave = async () => {
    try {
      const payload = {
        type: activeTab.toUpperCase(),
        emissions: totalKg,
        carbonOffset: isOffset ? Math.abs(totalKg) : 0,
        data: {
          ...results,
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">
          {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Emissions
          Summary
        </h2>
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          <i className="fas fa-arrow-left"></i>
          Back to Calculator
        </button>
      </div>

      {/* Emissions Visualization */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="flex justify-center items-end h-40 gap-6 mb-4">
          <div className="text-center">
            <div
              className="w-16 bg-red-500 rounded-t-lg relative transition-all duration-1000 mx-auto"
              style={{
                height: isOffset ? "0px" : `${Math.min(120, totalKg / 50)}px`,
              }}
            >
              <div className="absolute -top-8 left-0 right-0 text-center text-sm font-medium text-red-600">
                {totalKg.toFixed(1)} kg
              </div>
            </div>
            <div className="mt-3 text-sm font-medium text-gray-600">
              Monthly Emissions
            </div>
          </div>

          <div className="text-center">
            <div
              className="w-16 bg-green-500 rounded-t-lg relative transition-all duration-1000 mx-auto"
              style={{
                height: isOffset
                  ? `${Math.min(120, Math.abs(totalKg) / 50)}px`
                  : "0px",
              }}
            >
              <div className="absolute -top-8 left-0 right-0 text-center text-sm font-medium text-green-600">
                {isOffset ? Math.abs(totalKg).toFixed(1) : "0.0"} kg
              </div>
            </div>
            <div className="mt-3 text-sm font-medium text-gray-600">
              Carbon Offset
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Emission Breakdown
        </h3>
        <div className="space-y-4">
          {Object.entries(results).map(
            ([key, value]) =>
              key !== "total" && (
                <div
                  key={key}
                  className="border-b border-gray-100 pb-4 last:border-b-0"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800">
                        {getEmissionCategoryName(key)}
                      </h4>
                      {getEmissionDescription(key) && (
                        <p className="text-sm text-gray-500 mt-1">
                          {getEmissionDescription(key)}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-lg">
                        {value.toFixed(1)}{" "}
                        <span className="text-sm font-normal">kg CO₂e</span>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getColor(activeTab)}`}
                      style={{
                        width: `${Math.min(
                          100,
                          (Math.abs(value) / Math.abs(totalKg)) * 100
                        )}%`,
                      }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {((Math.abs(value) / Math.abs(totalKg)) * 100).toFixed(1)}%
                    of total emissions
                  </div>
                </div>
              )
          )}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-red-600">{totalTonnes}</div>
          <div className="text-sm text-red-700 font-medium">
            Tonnes CO₂e/month
          </div>
          <div className="text-xs text-red-500 mt-1">
            Total Monthly Emissions
          </div>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-orange-600">
            {dailyAverage}
          </div>
          <div className="text-sm text-orange-700 font-medium">kg CO₂e/day</div>
          <div className="text-xs text-orange-500 mt-1">Daily Average</div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {((totalKg * 12) / 1000).toFixed(1)}
          </div>
          <div className="text-sm text-blue-700 font-medium">
            Tonnes CO₂e/year
          </div>
          <div className="text-xs text-blue-500 mt-1">Annual Projection</div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={handleSave}
          className="flex-1 py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
        >
          <i className="fas fa-save"></i>
          Save Calculation
        </button>

        <button
          onClick={() => {
            console.log("Navigate to offset options");
          }}
          className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
        >
          <i className="fas fa-leaf"></i>
          Offset Emissions
        </button>
      </div>
    </div>
  );
};

export default CalculatorResults;
