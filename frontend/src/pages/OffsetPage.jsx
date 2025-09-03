import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getUserCalculations } from "../services/calculationService";
import { createOffset, getOffsets } from "../services/offsetService";

export default function OffsetPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const baseline = location.state?.baseline || null;

  const [calculations, setCalculations] = useState([]);
  const [offsets, setOffsets] = useState([]);
  const [improvedData, setImprovedData] = useState({
    fuelType: "lpg",
    cookingMeals: baseline?.data?.cookingMeals || 4,
    cookingDuration: baseline?.data?.cookingDuration || 4,
    charcoalUsed: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  // New methods the user has adopted to reduce emissions
  const [methods, setMethods] = useState({
    treePlanting: false,
    treesPlanted: 0,
    improvedCookstove: false,
    solarCooking: false,
    biogas: false,
    electricityShift: false,
  });

  useEffect(() => {
    const load = async () => {
      try {
        const [calcs, offs] = await Promise.all([getUserCalculations(), getOffsets()]);
        setCalculations(calcs || []);
        setOffsets(offs || []);
      } catch (e) {
        console.error(e);
        setError("Failed to load data");
      }
    };
    load();
  }, []);

  const estimatedImprovedEmissions = useMemo(() => {
    // Reuse the same cooking logic as calculator page for estimation
    const fuelFactors = { wood: 1.5, charcoal: 2.2, lpg: 0.8, electricity: 0.5 };
    const cookingMeals = parseFloat(improvedData.cookingMeals) || 0;
    const cookingDuration = parseFloat(improvedData.cookingDuration) || 0;
    const charcoalUsed = parseFloat(improvedData.charcoalUsed) || 0;

    let cookingEmissions = 0;
    let charcoalEmissions = 0;

    if (improvedData.fuelType === "charcoal") {
      charcoalEmissions = charcoalUsed * 2.2 * 30;
      cookingEmissions = cookingMeals * cookingDuration * 0.5 * 30;
    } else {
      const fuelFactor = fuelFactors[improvedData.fuelType] || 1.0;
      cookingEmissions = cookingMeals * cookingDuration * fuelFactor * 30;
    }

    const mealPreparationEmissions = cookingMeals * 0.3 * 30;
    const durationImpact = cookingDuration * 0.2 * 30;
    const total = cookingEmissions + charcoalEmissions + mealPreparationEmissions + durationImpact;
    return total; // kg/month
  }, [improvedData]);

  const baselineEmissions = baseline?.total ?? 0; // kg/month
  const improvement = Math.max(0, baselineEmissions - estimatedImprovedEmissions);

  const handleSubmitOffset = async () => {
    try {
      setIsSubmitting(true);
      setError(null);
      setSuccess(null);

      // Estimate additional offsets from selected methods (simplified factors)
      let methodOffset = 0;
      // Tree planting: ~21.77 kg CO2/tree/year -> ~1.81 kg/month
      if (methods.treePlanting && methods.treesPlanted > 0) {
        methodOffset += Number(methods.treesPlanted) * 1.81;
      }
      // Improved cookstove: assume 20 kg/month saved
      if (methods.improvedCookstove) methodOffset += 20;
      // Solar cooking: assume 30 kg/month saved
      if (methods.solarCooking) methodOffset += 30;
      // Biogas: assume 35 kg/month saved
      if (methods.biogas) methodOffset += 35;
      // Shift to electricity: assume 10 kg/month saved
      if (methods.electricityShift) methodOffset += 10;

      const totalOffsetAmount = Math.max(0, (improvement || 0)) + methodOffset;

      // Create an offset record including details
      const payload = {
        amount: totalOffsetAmount,
        baselineCalculationId: baseline?.id || null,
        improvedCalculationId: null,
        details: {
          baselineEmissions,
          estimatedImprovedEmissions,
          improvement,
          methods,
          methodOffset,
          unit: "kg/month",
        },
      };
      await createOffset(payload);
      setSuccess("Offset recorded successfully.");
      const offs = await getOffsets();
      setOffsets(offs || []);
    } catch (e) {
      console.error(e);
      setError(e?.response?.data?.error || e.message || "Failed to create offset");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Offset Emissions</h1>
          <button
            onClick={() => navigate("/dashboard")}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 w-full sm:w-auto"
          >
            Back to Dashboard
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-green-100 border border-green-300 text-green-700 rounded">
            {success}
          </div>
        )}

        {/* Baseline vs Improved */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <h2 className="text-lg font-semibold mb-2">Baseline (Current)</h2>
            <p className="text-gray-600 text-sm mb-4">
              Based on your previous calculation results
            </p>
            <div className="text-3xl font-bold text-red-600">
              {(baselineEmissions / 1000).toFixed(2)} <span className="text-sm">tonnes CO₂e/month</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <h2 className="text-lg font-semibold mb-2">Improved Scenario</h2>
            <p className="text-gray-600 text-sm mb-4">Model a cleaner cooking setup</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Fuel Type</label>
                <select
                  className="w-full p-2 border rounded"
                  value={improvedData.fuelType}
                  onChange={(e) => setImprovedData((p) => ({ ...p, fuelType: e.target.value }))}
                >
                  <option value="wood">Wood</option>
                  <option value="charcoal">Charcoal</option>
                  <option value="lpg">LPG</option>
                  <option value="electricity">Electricity</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Meals per day</label>
                <input
                  type="number"
                  className="w-full p-2 border rounded"
                  value={improvedData.cookingMeals}
                  min={1}
                  max={15}
                  onChange={(e) => setImprovedData((p) => ({ ...p, cookingMeals: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Cooking duration (hours/day)</label>
                <input
                  type="number"
                  step="0.5"
                  className="w-full p-2 border rounded"
                  value={improvedData.cookingDuration}
                  min={0.5}
                  max={12}
                  onChange={(e) => setImprovedData((p) => ({ ...p, cookingDuration: e.target.value }))}
                />
              </div>

              {improvedData.fuelType === "charcoal" && (
                <div>
                  <label className="block text-sm font-medium mb-1">Charcoal used (kg/day)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="w-full p-2 border rounded"
                    value={improvedData.charcoalUsed}
                    min={0}
                    max={10}
                    onChange={(e) => setImprovedData((p) => ({ ...p, charcoalUsed: e.target.value }))}
                  />
                </div>
              )}
            </div>

            <div className="mt-4 p-3 bg-gray-50 rounded border">
              <div className="text-sm text-gray-600">Estimated Improved Emissions</div>
              <div className="text-2xl font-bold text-green-700">
                {(estimatedImprovedEmissions / 1000).toFixed(2)} <span className="text-sm">tonnes CO₂e/month</span>
              </div>
            </div>
          </div>
        </div>

        {/* Improvement summary */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-8">
          <h3 className="text-lg font-semibold mb-2">Improvement Summary</h3>
          <p className="text-gray-700">
            Estimated reduction: <span className="font-bold text-green-700">{(improvement / 1000).toFixed(2)} tonnes CO₂e/month</span>
          </p>
        </div>

        {/* Additional offset methods */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-8">
          <h3 className="text-lg font-semibold mb-2">Additional Offset Methods</h3>
          <p className="text-gray-600 text-sm mb-4">Select the methods you have started using.</p>
          <div className="space-y-4">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={methods.treePlanting}
                onChange={(e) => setMethods((m) => ({ ...m, treePlanting: e.target.checked }))}
              />
              <span>Tree Planting</span>
            </label>
            {methods.treePlanting && (
              <div className="pl-7">
                <label className="block text-sm text-gray-600 mb-1">How many trees planted?</label>
                <input
                  type="number"
                  min={0}
                  className="w-full sm:w-64 p-2 border rounded"
                  value={methods.treesPlanted}
                  onChange={(e) => setMethods((m) => ({ ...m, treesPlanted: Number(e.target.value) }))}
                />
                <div className="text-xs text-gray-500 mt-1">Approx. 1.81 kg CO₂ per tree per month</div>
              </div>
            )}

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={methods.improvedCookstove}
                onChange={(e) => setMethods((m) => ({ ...m, improvedCookstove: e.target.checked }))}
              />
              <span>Improved Cookstove</span>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={methods.solarCooking}
                onChange={(e) => setMethods((m) => ({ ...m, solarCooking: e.target.checked }))}
              />
              <span>Solar Cooking</span>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={methods.biogas}
                onChange={(e) => setMethods((m) => ({ ...m, biogas: e.target.checked }))}
              />
              <span>Biogas for Cooking</span>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={methods.electricityShift}
                onChange={(e) => setMethods((m) => ({ ...m, electricityShift: e.target.checked }))}
              />
              <span>Shifted to Electricity</span>
            </label>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <button
            onClick={handleSubmitOffset}
            disabled={isSubmitting}
            className={`px-5 sm:px-6 py-3 rounded text-white w-full sm:w-auto ${isSubmitting ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"}`}
          >
            {isSubmitting ? "Recording..." : "Record Offset"}
          </button>
          <button
            onClick={() => navigate("/calculator")}
            className="px-5 sm:px-6 py-3 rounded bg-gray-200 hover:bg-gray-300 w-full sm:w-auto"
          >
            Adjust Inputs
          </button>
        </div>

        {/* Recent offsets */}
        <div className="mt-10">
          <h3 className="text-lg font-semibold mb-4">Recent Offsets</h3>
          <div className="bg-white rounded-lg shadow divide-y">
            {offsets && offsets.length > 0 ? (
              offsets.map((o) => (
                <div key={o.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div>
                    <div className="text-xs sm:text-sm text-gray-600">{new Date(o.createdAt).toLocaleString()}</div>
                    <div className="text-gray-800">Amount: {(o.amount / 1000).toFixed(2)} tonnes CO₂e</div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {o.baselineCalculation ? `Baseline calc #${o.baselineCalculation.id}` : "Manual"}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-gray-500">No offsets yet</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}






