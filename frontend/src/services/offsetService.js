import api from "./api";

export const createOffset = async ({ amount, baselineCalculationId, improvedCalculationId }) => {
  const response = await api.post("/offsets", {
    amount,
    baselineCalculationId,
    improvedCalculationId,
  });
  return response.data;
};

export const getOffsets = async () => {
  const response = await api.get("/offsets");
  return response.data;
};






