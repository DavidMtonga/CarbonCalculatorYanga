import api from "./api";

export const getAdminStats = async () => {
  const response = await api.get("/admin/stats");
  return response.data;
};

export const getAllUsers = async () => {
  const response = await api.get("/admin/users");
  return response.data;
};

export const getAllCalculations = async () => {
  const response = await api.get("/admin/calculations");
  return response.data;
};

export const exportCalculations = async () => {
  const response = await api.get("/admin/export", {
    responseType: "blob", // Important for file downloads
  });
  return response.data;
};
