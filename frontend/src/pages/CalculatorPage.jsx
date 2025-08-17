import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { saveCalculation } from "../services/calculationService";
import CalculatorTabs from "../components/calculator/CalculatorTabs";
import CalculatorForm from "../components/calculator/CalculatorForm";
import CalculatorResults from "../components/calculator/CalculatorResults";
import CarbonOffsetCards from "../components/layout/CarbonOffsetCards";

export default function CalculatorPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentSection, setCurrentSection] = useState("cooking");
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleCalculate = async (calculationData) => {
    try {
      setIsLoading(true);
      setSaveError(null);
      setSaveSuccess(false);

      const type = calculationData.type || currentSection;
      if (!type) {
        throw new Error("Calculation type is required");
      }

      // Perform calculation
      const calculationResult = calculateSection(type, calculationData.data);
      setResults(calculationResult);

      // Save to backend if user is logged in
      if (user) {
        try {
          const payload = {
            type: type.toUpperCase(),
            emissions:
              calculationResult.total > 0 ? calculationResult.total : 0,
            carbonOffset:
              calculationResult.total < 0
                ? Math.abs(calculationResult.total)
                : 0,
            data: calculationData.data,
          };

          console.log("Sending payload:", payload);

          await saveCalculation(payload);
          setSaveSuccess(true);
        } catch (error) {
          console.error("Save error:", error);
          setSaveError(
            error.message || "Failed to save calculation. Please try again."
          );
        }
      }
    } catch (error) {
      console.error("Calculation error:", error);
      setSaveError("An error occurred during calculation. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const calculateSection = (section, data) => {
    const calculationFunctions = {
      cooking: () => {
        // Enhanced cooking calculations with VERRA methodology
        const fuelFactors = {
          wood: 1.5, // kg CO2e per hour of cooking
          charcoal: 2.2, // kg CO2e per kg of charcoal
          lpg: 0.8, // kg CO2e per hour of cooking
          electricity: 0.5, // kg CO2e per hour of cooking
        };

        let cookingEmissions = 0;
        let charcoalEmissions = 0;

        if (data.fuelType === "charcoal") {
          // VERRA calculation for charcoal
          // Emission factor: 2.2 kg CO2e per kg of charcoal
          charcoalEmissions = data.charcoalUsed * 2.2 * 30; // Monthly emissions
          cookingEmissions =
            data.cookingMeals * data.cookingDuration * 0.5 * 30; // Additional cooking process emissions
        } else {
          // Standard calculation for other fuel types
          const fuelFactor = fuelFactors[data.fuelType] || 1.0;
          cookingEmissions =
            data.cookingMeals * data.cookingDuration * fuelFactor * 30;
        }

        // Meal preparation emissions (based on number of meals)
        const mealPreparationEmissions = data.cookingMeals * 0.3 * 30; // 0.3 kg CO2e per meal

        return {
          "Fuel Consumption": cookingEmissions,
          ...(data.fuelType === "charcoal" && {
            "Charcoal Emissions (VERRA)": charcoalEmissions,
          }),
          "Meal Preparation": mealPreparationEmissions,
          "Cooking Duration Impact": data.cookingDuration * 0.2 * 30,
        };
      },
    };

    if (!calculationFunctions[section]) {
      return { total: 0 };
    }

    const results = calculationFunctions[section]();
    results.total = Object.values(results).reduce((sum, val) => sum + val, 0);
    return results;
  };

  const handleSave = () => {
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-center mb-2 text-green-700">
          Carbon Calculator Yanga
        </h1>

        {saveError && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded max-w-4xl mx-auto">
            {saveError}
          </div>
        )}

        {saveSuccess && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded max-w-4xl mx-auto">
            Calculation saved successfully!
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Main Calculator Section */}
          <div className="flex-1 max-w-4xl">
            <CalculatorTabs
              activeTab={currentSection}
              onTabChange={setCurrentSection}
            />

            {!results ? (
              <div className="bg-white rounded-lg shadow-md p-6">
                <CalculatorForm
                  activeTab={currentSection}
                  onCalculate={handleCalculate}
                  isLoading={isLoading}
                />
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-6">
                <CalculatorResults
                  results={results}
                  activeTab={currentSection}
                  onBack={() => setResults(null)}
                  onSave={user ? handleSave : null}
                  saveSuccess={saveSuccess}
                />
              </div>
            )}
          </div>

          {/* Carbon Offset Cards - Sidebar */}
          <div className="lg:sticky lg:top-8">
            <CarbonOffsetCards />
          </div>
        </div>
      </div>
    </div>
  );
}
