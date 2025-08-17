import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  saveCalculation,
  getMyCalculations,
} from "../../services/calculationService";
import CalculatorTabs from "../../components/calculator/CalculatorTabs";
import CalculatorForm from "../../components/calculator/CalculatorForm";
import CalculatorResults from "../../components/calculator/CalculatorResults";
import CarbonOffsetCards from "../../components/layout/CarbonOffsetCards";
import UserTable from "../../components/dashboard/UserTable";

export default function UserDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentSection, setCurrentSection] = useState("cooking");
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [calculations, setCalculations] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Load user's calculation history on component mount
  useEffect(() => {
    loadCalculations();
  }, []);

  const loadCalculations = async () => {
    if (!user) return;

    try {
      setLoadingHistory(true);
      const data = await getMyCalculations();
      setCalculations(data);
    } catch (error) {
      console.error("Error loading calculations:", error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleCalculate = async (section, formData) => {
    try {
      setIsLoading(true);
      setSaveError(null);
      setSaveSuccess(false);

      console.log("handleCalculate called with:", { section, formData });

      // Perform calculation
      const calculationResult = calculateSection(section, formData);
      console.log("Calculation result:", calculationResult);
      setResults(calculationResult);

      // Prepare data for saving to database
      const saveData = {
        type: section.toUpperCase(),
        emissions: parseFloat(calculationResult.total.toFixed(2)),
        carbonOffset: 0, // Set default, can be updated based on calculation type
        ...formData, // Spread all form data fields
      };

      console.log("Data to save:", saveData);

      // Save to backend if user is logged in
      if (user) {
        try {
          await saveCalculation(saveData);
          setSaveSuccess(true);
          // Reload calculations to show the new one
          await loadCalculations();
        } catch (error) {
          console.error("Save error:", error);
          setSaveError(error.message || "Failed to save calculation");
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
    console.log("calculateSection called with:", { section, data });

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
        let fuelConsumption = 0;

        if (data.fuelType === "charcoal") {
          // VERRA calculation for charcoal
          charcoalEmissions = (data.charcoalUsed || 0) * 2.2 * 30; // Monthly emissions
          cookingEmissions =
            (data.cookingMeals || 0) * (data.cookingDuration || 0) * 0.5 * 30;
        } else {
          // Standard calculation for other fuel types
          const fuelFactor = fuelFactors[data.fuelType] || 1.0;
          cookingEmissions =
            (data.cookingMeals || 0) *
            (data.cookingDuration || 0) *
            fuelFactor *
            30;
        }

        // Meal preparation emissions
        const mealPreparationEmissions = (data.cookingMeals || 0) * 0.3 * 30;
        const cookingDurationImpact = (data.cookingDuration || 0) * 0.2 * 30;

        const breakdown = {
          "Fuel Consumption": cookingEmissions,
          "Meal Preparation": mealPreparationEmissions,
          "Cooking Duration Impact": cookingDurationImpact,
        };

        if (data.fuelType === "charcoal") {
          breakdown["Charcoal Emissions (VERRA)"] = charcoalEmissions;
        }

        breakdown.total = Object.values(breakdown).reduce(
          (sum, val) => sum + val,
          0
        );

        console.log("Calculation breakdown:", breakdown);
        return breakdown;
      },
    };

    if (!calculationFunctions[section]) {
      console.warn("No calculation function found for section:", section);
      return { total: 0 };
    }

    return calculationFunctions[section]();
  };

  const handleSave = () => {
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-center mb-2 text-green-700">
          Carbon Calculator Dashboard
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
              <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <CalculatorForm
                  activeTab={currentSection}
                  onCalculate={handleCalculate}
                  isLoading={isLoading}
                />
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <CalculatorResults
                  results={results}
                  activeTab={currentSection}
                  onBack={() => setResults(null)}
                  onSave={user ? handleSave : null}
                  saveSuccess={saveSuccess}
                />
              </div>
            )}

            {/* Calculation History */}
            {user && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  Calculation History
                </h2>
                <UserTable
                  calculations={calculations}
                  isLoading={loadingHistory}
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
