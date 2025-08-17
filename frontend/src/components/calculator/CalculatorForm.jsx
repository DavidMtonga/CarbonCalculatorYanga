import { useState } from "react";

const CalculatorForm = ({ activeTab = "cooking", onCalculate, isLoading }) => {
  const [formData, setFormData] = useState({
    cookingMeals: 4,
    fuelType: "wood",
    cookingDuration: 4.5,
    charcoalUsed: 2.5,
  });

  const [formErrors, setFormErrors] = useState({});

  const handleSliderChange = (e) => {
    const { id, value } = e.target;
    const fieldName = id.replace("Slider", "");
    setFormData((prev) => ({
      ...prev,
      [fieldName]: parseFloat(value),
    }));

    if (formErrors[fieldName]) {
      setFormErrors((prev) => ({ ...prev, [fieldName]: null }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const errors = {};
    let isValid = true;

    if (activeTab === "cooking") {
      if (!formData.fuelType || formData.fuelType.trim() === "") {
        errors.fuelType = "Fuel type is required";
        isValid = false;
      }
      if (!formData.cookingDuration || formData.cookingDuration <= 0) {
        errors.cookingDuration = "Valid cooking duration is required";
        isValid = false;
      }
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Pass type as activeTab to ensure it's never undefined
    onCalculate({
      type: activeTab,
      data: formData,
    });
  };

  if (!activeTab) {
    return <div className="p-4 text-center">Loading calculator...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-gray-600 text-white text-center py-3 rounded-lg mb-6">
        <span className="text-sm font-medium">
          Verified using Gold Standard & CDM methodologies
        </span>
      </div>

      {formErrors.general && (
        <div className="p-3 bg-red-100 text-red-700 rounded-md">
          {formErrors.general}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {activeTab === "cooking" && (
          <>
            {/* Meals */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-gray-700 font-medium">
                Meals Cooked per Day
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  min="1"
                  max="10"
                  value={formData.cookingMeals}
                  step="1"
                  id="cookingMealsSlider"
                  onChange={handleSliderChange}
                  style={{
                    background: `linear-gradient(to right, #22c55e 0%, #22c55e ${
                      ((formData.cookingMeals - 1) / 9) * 100
                    }%, #e5e7eb ${
                      ((formData.cookingMeals - 1) / 9) * 100
                    }%, #e5e7eb 100%)`,
                  }}
                />
                <div className="w-16 text-center px-3 py-2 border border-gray-300 rounded-md bg-gray-50 font-medium">
                  {formData.cookingMeals}
                </div>
              </div>
            </div>

            {/* Fuel Type */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-gray-700 font-medium">
                Fuel Type
              </label>
              <select
                name="fuelType"
                value={formData.fuelType}
                onChange={handleInputChange}
                className={`w-full p-3 border ${
                  formErrors.fuelType ? "border-red-500" : "border-gray-300"
                } rounded-md focus:ring-2 focus:ring-pink-500 focus:border-pink-500`}
                required
              >
                <option value="">Select fuel type</option>
                <option value="wood">Wood</option>
                <option value="charcoal">Charcoal</option>
                <option value="lpg">LPG</option>
                <option value="electricity">Electricity</option>
              </select>
              {formErrors.fuelType && (
                <p className="text-red-500 text-sm">{formErrors.fuelType}</p>
              )}
            </div>

            {/* Cooking Duration */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-gray-700 font-medium">
                Daily Cooking Duration (hours)
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  className={`w-full h-3 ${
                    formErrors.cookingDuration ? "bg-red-100" : "bg-gray-200"
                  } rounded-lg appearance-none cursor-pointer slider`}
                  min="0.5"
                  max="12"
                  value={formData.cookingDuration}
                  step="0.5"
                  id="cookingDurationSlider"
                  onChange={handleSliderChange}
                  style={{
                    background: `linear-gradient(to right, #22c55e 0%, #22c55e ${
                      ((formData.cookingDuration - 0.5) / 11.5) * 100
                    }%, #e5e7eb ${
                      ((formData.cookingDuration - 0.5) / 11.5) * 100
                    }%, #e5e7eb 100%)`,
                  }}
                />
                <div className="w-16 text-center px-3 py-2 border border-gray-300 rounded-md bg-gray-50 font-medium">
                  {formData.cookingDuration.toFixed(1)}
                </div>
              </div>
              {formErrors.cookingDuration && (
                <p className="text-red-500 text-sm">
                  {formErrors.cookingDuration}
                </p>
              )}
            </div>

            {/* Charcoal Used */}
            {formData.fuelType === "charcoal" && (
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-gray-700 font-medium">
                  Charcoal Used per Day (kg)
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    min="0.5"
                    max="10"
                    value={formData.charcoalUsed}
                    step="0.1"
                    id="charcoalUsedSlider"
                    onChange={handleSliderChange}
                    style={{
                      background: `linear-gradient(to right, #22c55e 0%, #22c55e ${
                        ((formData.charcoalUsed - 0.5) / 9.5) * 100
                      }%, #e5e7eb ${
                        ((formData.charcoalUsed - 0.5) / 9.5) * 100
                      }%, #e5e7eb 100%)`,
                    }}
                  />
                  <div className="w-16 text-center px-3 py-2 border border-gray-300 rounded-md bg-gray-50 font-medium">
                    {formData.charcoalUsed.toFixed(1)}
                  </div>
                </div>
                <p className="text-sm text-gray-500">
                  Used for VERRA calculation methodology
                </p>
              </div>
            )}
          </>
        )}

        <button
          type="submit"
          className={`w-full py-3 px-4 rounded-lg text-white font-medium flex items-center justify-center gap-2 ${
            isLoading
              ? "bg-gray-500"
              : activeTab === "cooking"
              ? "bg-pink-600 hover:bg-pink-700"
              : "bg-gray-600 hover:bg-gray-700"
          } transition-colors duration-200`}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Calculating...
            </>
          ) : (
            <>
              <i className="fas fa-calculator"></i> Calculate{" "}
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Emissions
            </>
          )}
        </button>
      </form>

      <style>
        {`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #22c55e;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #22c55e;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        `}
      </style>
    </div>
  );
};

export default CalculatorForm;
