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
      if (!formData.cookingMeals || formData.cookingMeals <= 0) {
        errors.cookingMeals = "Number of meals is required";
        isValid = false;
      }
      if (
        formData.fuelType === "charcoal" &&
        (!formData.charcoalUsed || formData.charcoalUsed <= 0)
      ) {
        errors.charcoalUsed = "Charcoal amount is required when using charcoal";
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
      <div className=" bg-gray-400 text-white py-2 rounded-lg mb-2 p-2">
        <div className="flex items-center justify-center gap-2 mb-2">
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
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="font-semibold">
            Verified Methodologies Using Gold Standard & CDM methodologies
          </span>
        </div>
      </div>

      {formErrors.general && (
        <div className="p-3 bg-red-100 text-red-700 rounded-md border border-red-300">
          {formErrors.general}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {activeTab === "cooking" && (
          <>
            {/* Cooking Fuel Type */}
            <div className="space-y-3">
              <label className="block text-gray-700 font-medium text-md">
                Cooking Fuel Type
              </label>
              <select
                name="fuelType"
                value={formData.fuelType}
                onChange={handleInputChange}
                className={`w-full p-4 border-2 ${
                  formErrors.fuelType
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300"
                } rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors text-md`}
                required
              >
                <option value="">Select fuel type</option>
                <option value="wood">Wood</option>
                <option value="charcoal">Charcoal</option>
                <option value="lpg">LPG (Liquefied Petroleum Gas)</option>
                <option value="electricity">Electricity</option>
              </select>
              {formErrors.fuelType && (
                <p className="text-red-500 text-sm flex items-center gap-1">
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {formErrors.fuelType}
                </p>
              )}
            </div>

            {/* Meals Cooked per Day */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-gray-700 font-medium text-md">
                <svg
                  className="h-5 w-5 text-pink-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                  />
                </svg>
                Meals Cooked per Day
              </label>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-4 mb-2">
                  <input
                    type="range"
                    className="flex-1 h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    min="1"
                    max="15"
                    value={formData.cookingMeals}
                    step="1"
                    id="cookingMealsSlider"
                    onChange={handleSliderChange}
                    style={{
                      background: `linear-gradient(to right, #ec4899 0%, #ec4899 ${
                        ((formData.cookingMeals - 1) / 14) * 100
                      }%, #e5e7eb ${
                        ((formData.cookingMeals - 1) / 14) * 100
                      }%, #e5e7eb 100%)`,
                    }}
                  />
                  <div className="w-20 text-center px-3 py-2 border-2 border-pink-300 rounded-lg bg-white font-bold text-md text-pink-700">
                    {formData.cookingMeals}
                  </div>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>1 meal</span>
                  <span>15 meals</span>
                </div>
              </div>
              {formErrors.cookingMeals && (
                <p className="text-red-500 text-sm flex items-center gap-1">
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {formErrors.cookingMeals}
                </p>
              )}
            </div>

            {/* Daily Cooking Duration */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-gray-700 font-medium text-md">
                <svg
                  className="h-5 w-5 text-pink-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Daily Cooking Duration (hours)
              </label>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-4 mb-2">
                  <input
                    type="range"
                    className={`flex-1 h-3 ${
                      formErrors.cookingDuration ? "bg-red-100" : "bg-gray-200"
                    } rounded-lg appearance-none cursor-pointer slider`}
                    min="0.5"
                    max="12"
                    value={formData.cookingDuration}
                    step="0.5"
                    id="cookingDurationSlider"
                    onChange={handleSliderChange}
                    style={{
                      background: `linear-gradient(to right, #ec4899 0%, #ec4899 ${
                        ((formData.cookingDuration - 0.5) / 11.5) * 100
                      }%, #e5e7eb ${
                        ((formData.cookingDuration - 0.5) / 11.5) * 100
                      }%, #e5e7eb 100%)`,
                    }}
                  />
                  <div className="w-20 text-center px-3 py-2 border-2 border-pink-300 rounded-lg bg-white font-bold text-md text-pink-700">
                    {formData.cookingDuration.toFixed(1)}
                  </div>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>0.5 hours</span>
                  <span>12 hours</span>
                </div>
              </div>
              {formErrors.cookingDuration && (
                <p className="text-red-500 text-sm flex items-center gap-1">
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {formErrors.cookingDuration}
                </p>
              )}
            </div>

            {/* Charcoal Used - Only show when charcoal is selected */}
            {formData.fuelType === "charcoal" && (
              <div className="space-y-3 bg-blue-50 p-4 rounded-lg border border-blue-200">
                <label className="flex items-center gap-2 text-gray-700 font-medium text-md">
                  <svg
                    className="h-5 w-5 text-blue-600"
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
                  Charcoal Used per Day (kg)
                </label>
                <div className="bg-white p-4 rounded-lg">
                  <div className="flex items-center gap-4 mb-2">
                    <input
                      type="range"
                      className="flex-1 h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                      min="0.5"
                      max="10"
                      value={formData.charcoalUsed}
                      step="0.1"
                      id="charcoalUsedSlider"
                      onChange={handleSliderChange}
                      style={{
                        background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${
                          ((formData.charcoalUsed - 0.5) / 9.5) * 100
                        }%, #e5e7eb ${
                          ((formData.charcoalUsed - 0.5) / 9.5) * 100
                        }%, #e5e7eb 100%)`,
                      }}
                    />
                    <div className="w-20 text-center px-3 py-2 border-2 border-blue-300 rounded-lg bg-white font-bold text-md text-blue-700">
                      {formData.charcoalUsed.toFixed(1)}
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mb-2">
                    <span>0.5 kg</span>
                    <span>10 kg</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-blue-700">
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>Used for VERRA calculation methodology</span>
                  </div>
                </div>
                {formErrors.charcoalUsed && (
                  <p className="text-red-500 text-sm flex items-center gap-1">
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {formErrors.charcoalUsed}
                  </p>
                )}
              </div>
            )}
          </>
        )}

        <button
          type="submit"
          className={`w-full py-4 px-6 rounded-lg text-white font-bold text-md flex items-center justify-center gap-3 transition-all duration-200 ${
            isLoading
              ? "bg-gray-500 cursor-not-allowed"
              : activeTab === "cooking"
              ? "bg-gradient-to-r from-pink-600 to-pink-700 hover:from-pink-700 hover:to-pink-800 shadow-lg hover:shadow-xl"
              : "bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 shadow-lg hover:shadow-xl"
          }`}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <svg
                className="animate-spin h-5 w-5 text-white"
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
              Calculating Emissions...
            </>
          ) : (
            <>
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
              Calculate {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}{" "}
              Emissions
            </>
          )}
        </button>
        
      </form>

      <style>
        {`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 22px;
          width: 22px;
          border-radius: 50%;
          background: #ec4899;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
          border: 2px solid white;
        }
        .slider::-moz-range-thumb {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #ec4899;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
        }
        #charcoalUsedSlider::-webkit-slider-thumb {
          background: #3b82f6;
        }
        #charcoalUsedSlider::-moz-range-thumb {
          background: #3b82f6;
        }
        `}
      </style>
    </div>
  );
};

export default CalculatorForm;
