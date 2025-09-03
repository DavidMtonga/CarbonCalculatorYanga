import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { saveCalculation } from "../services/calculationService";
import CalculatorTabs from "../components/calculator/CalculatorTabs";
import CalculatorForm from "../components/calculator/CalculatorForm";
import CalculatorResults from "../components/calculator/CalculatorResults";
import CarbonOffsetCards from "../components/layout/CarbonOffsetCards";
import Footer from "../components/layout/Footer";
import VerificationPartners from "../components/layout/VerificationPartners";
import PartnersScroller from "../components/layout/PartnersScroller";
import Button from "../components/ui/Button";

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

      // Do not auto-save to avoid duplicate entries; saving happens via the button in results
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

        const cookingMeals = parseFloat(data.cookingMeals) || 0;
        const cookingDuration = parseFloat(data.cookingDuration) || 0;
        const charcoalUsed = parseFloat(data.charcoalUsed) || 0;

        if (data.fuelType === "charcoal") {
          // VERRA calculation for charcoal
          // Emission factor: 2.2 kg CO2e per kg of charcoal
          charcoalEmissions = charcoalUsed * 2.2 * 30; // Monthly emissions
          cookingEmissions = cookingMeals * cookingDuration * 0.5 * 30; // Additional cooking process emissions
        } else {
          // Standard calculation for other fuel types
          const fuelFactor = fuelFactors[data.fuelType] || 1.0;
          cookingEmissions = cookingMeals * cookingDuration * fuelFactor * 30;
        }

        // Meal preparation emissions (based on number of meals)
        const mealPreparationEmissions = cookingMeals * 0.3 * 30; // 0.3 kg CO2e per meal

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

  const handleOffsetEmissions = () => {
    // Navigate to offset page with current calculation results
    navigate("/offset", {
      state: {
        baseline: {
          total: results.total,
          data: {
            fuelType: results.fuelType,
            cookingDuration: results.cookingDuration,
            cookingMeals: results.cookingMeals,
            charcoalUsed: results.charcoalUsed,
          },
        },
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-green-700 mb-2">
            Carbon Calculator Yanga
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Calculate your carbon footprint with verified methodologies
          </p>
        </div>

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

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
          {/* Main Calculator Section */}
          <div className="flex-1 w-full max-w-4xl">
            <CalculatorTabs
              activeTab={currentSection}
              onTabChange={setCurrentSection}
            />

            {!results ? (
              <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
                <CalculatorForm
                  activeTab={currentSection}
                  onCalculate={handleCalculate}
                  isLoading={isLoading}
                />
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
                <CalculatorResults
                  results={results}
                  activeTab={currentSection}
                  onBack={() => setResults(null)}
                  onSave={user ? handleSave : null}
                  saveSuccess={saveSuccess}
                />
                
                {/* Offset Emissions Button */}
                <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200">
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    {user && (
                      <Button
                        onClick={handleOffsetEmissions}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-5 sm:px-6 py-3 rounded-lg font-semibold transition-colors duration-200 w-full sm:w-auto"
                      >
                        <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Offset Emissions
                      </Button>
                    )}
                    <Button
                      onClick={() => setResults(null)}
                      variant="outline"
                      className="px-5 sm:px-6 py-3 rounded-lg font-semibold transition-colors duration-200 w-full sm:w-auto"
                    >
                      Calculate Again
                    </Button>
                  </div>
                  {!user && (
                    <div className="mt-3 text-center text-xs sm:text-sm text-gray-600">
                      <p>Login to save calculations and access offset features</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Carbon Offset Cards - Sidebar */}
          <div className="w-full lg:w-auto lg:sticky lg:top-8">
            <CarbonOffsetCards />
          </div>
        </div>
      </div>
      <VerificationPartners />
      <Footer />
      {/* <PartnersScroller /> */}
    </div>
  );
}
