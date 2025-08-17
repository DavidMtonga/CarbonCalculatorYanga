import { Routes, Route } from "react-router-dom"; // Remove BrowserRouter from import
import { AuthProvider } from "./context/AuthContext";
import HomePage from "./pages/HomePage";
import DashboardPage from "./pages/DashboardPage";
import AdminPage from "./pages/AdminPage";
import AuthPage from "./pages/AuthPage";
import CalculatorPage from "./pages/CalculatorPage";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import { useState } from "react";

function App() {
  const [calculatorData, setCalculatorData] = useState({
    activeTab: "personal",
    showResults: false,
    results: null,
  });

  const handleTabChange = (tab) => {
    setCalculatorData((prev) => ({
      ...prev,
      activeTab: tab,
      showResults: false,
    }));
  };

  const handleCalculate = (formData) => {
    // Perform calculations based on activeTab and formData
    let calculatedResults = {};

    if (calculatorData.activeTab === "personal") {
      calculatedResults = {
        Commute: formData.commute * 0.26 * 22,
        Waste: formData.waste * 0.8 * 4,
        Electricity: formData.electricity * 0.15,
        Meals: formData.meals * 0.45 * 30,
        total: 0, // Will be calculated below
      };
    }
    // Add other tab calculations here

    calculatedResults.total = Object.values(calculatedResults).reduce(
      (sum, val) => sum + val,
      0
    );

    setCalculatorData((prev) => ({
      ...prev,
      results: calculatedResults,
      showResults: true,
    }));
  };

  const handleBackToCalculator = () => {
    setCalculatorData((prev) => ({
      ...prev,
      showResults: false,
    }));
  };

  return (
    <AuthProvider>
      {/* Remove <BrowserRouter> wrapper - it's already in main.jsx */}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<AuthPage />} />
        <Route
          path="/calculator"
          element={
            <CalculatorPage
              calculatorData={calculatorData}
              onTabChange={handleTabChange}
              onCalculate={handleCalculate}
              onBack={handleBackToCalculator}
            />
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly>
              <AdminPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  );
}

export default App;
