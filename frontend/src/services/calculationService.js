import api from "./api";

// Save calculation
export const saveCalculation = async (calculationData) => {
  const payload = {
    type: calculationData.type.toUpperCase(),
    emissions: parseFloat(calculationData.emissions),
    carbonOffset: parseFloat(calculationData.carbonOffset || 0),
    data: {
      cookingDuration: calculationData.data?.cookingDuration
        ? parseFloat(calculationData.data.cookingDuration)
        : null,
      cookingMeals: calculationData.data?.cookingMeals
        ? parseInt(calculationData.data.cookingMeals)
        : null,
      fuelType: calculationData.data?.fuelType || null,
      charcoalUsed: calculationData.data?.charcoalUsed
        ? parseFloat(calculationData.data.charcoalUsed)
        : null,
    },
  };

  const response = await api.post("/calculations", payload);
  return { data: response.data };
};

export const getUserCalculations = async () => {
  const response = await api.get("/calculations");
  return response.data;
};
