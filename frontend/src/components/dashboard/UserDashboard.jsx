import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  saveCalculation,
  getUserCalculations,
} from "../../services/calculationService";

import CalculatorTabs from "../../components/calculator/CalculatorTabs";
import CalculatorForm from "../../components/calculator/CalculatorForm";
import CalculatorResults from "../../components/calculator/CalculatorResults";
import CarbonOffsetCards from "../../components/layout/CarbonOffsetCards";

export default function CalculatorPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentSection, setCurrentSection] = useState("cooking");
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [calculations, setCalculations] = useState([]);

  useEffect(() => {
    const fetchUserCalculations = async () => {
      try {
        if (user?.id) {
          const data = await getUserCalculations();
          setCalculations(data);
        }
      } catch (err) {
        console.error("Error fetching calculations:", err);
        setSaveError("Failed to load calculations");
      }
    };
    fetchUserCalculations();
  }, [user]);

  const handleCalculate = async (calculationData) => {
    try {
      setIsLoading(true);
      setSaveError(null);
      setSaveSuccess(false);

      const type = calculationData.type || currentSection;
      if (!type) {
        throw new Error("Calculation type is required");
      }

      const calculationResult = calculateSection(type, calculationData.data);
      setResults(calculationResult);

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
            data: {
              cookingDuration:
                parseFloat(calculationData.data.cookingDuration) || 0,
              cookingMeals: parseInt(calculationData.data.cookingMeals) || 0,
              fuelType: calculationData.data.fuelType || "unknown",
              charcoalUsed: parseFloat(calculationData.data.charcoalUsed) || 0,
            },
          };

          console.log("Sending payload:", payload);
          const saved = await saveCalculation(payload);
          setCalculations((prev) => [...prev, saved.data]);
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
        const fuelFactors = {
          wood: 1.5,
          charcoal: 2.2,
          lpg: 0.8,
          electricity: 0.5,
        };

        let cookingEmissions = 0;
        let charcoalEmissions = 0;

        const cookingMeals = parseFloat(data.cookingMeals) || 0;
        const cookingDuration = parseFloat(data.cookingDuration) || 0;
        const charcoalUsed = parseFloat(data.charcoalUsed) || 0;

        if (data.fuelType === "charcoal") {
          charcoalEmissions = charcoalUsed * 2.2 * 30;
          cookingEmissions = cookingMeals * cookingDuration * 0.5 * 30;
        } else {
          const fuelFactor = fuelFactors[data.fuelType] || 1.0;
          cookingEmissions = cookingMeals * cookingDuration * fuelFactor * 30;
        }

        const mealPreparationEmissions = cookingMeals * 0.3 * 30;

        return {
          "Fuel Consumption": cookingEmissions,
          ...(data.fuelType === "charcoal" && {
            "Charcoal Emissions (VERRA)": charcoalEmissions,
          }),
          "Meal Preparation": mealPreparationEmissions,
          "Cooking Duration Impact": cookingDuration * 0.2 * 30,
        };
      },
    };

    if (!calculationFunctions[section]) return { total: 0 };

    const results = calculationFunctions[section]();
    results.total = Object.values(results).reduce((sum, val) => sum + val, 0);
    return results;
  };

  const handleSave = () => navigate("/dashboard");

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

          <div className="lg:sticky lg:top-8">
            <CarbonOffsetCards />
          </div>
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-md p-6 max-w-4xl mx-auto">
          <h3 className="text-xl font-semibold mb-4">Your Calculations</h3>
          {calculations.length === 0 ? (
            <p>No calculations saved yet.</p>
          ) : (
            <ul className="list-disc pl-5">
              {calculations.map((calc) => (
                <li key={calc.id || `calc-${calc.type}-${calc.createdAt}`}>
                  {calc.type} - {calc.emissions} kgCO₂e
                  {calc.createdAt && (
                    <span className="text-gray-500 text-sm ml-2">
                      ({new Date(calc.createdAt).toLocaleDateString()})
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
