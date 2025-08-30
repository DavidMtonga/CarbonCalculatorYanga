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

export const registerAdmin = async ({ name, email, password, organization, province, adminSecret }) => {
  const response = await api.post("/auth/register-admin", {
    name,
    email,
    password,
    organization,
    province,
    adminSecret,
  });
  return response.data;
};

export const createUserAsAdmin = async (payload) => {
  const response = await api.post("/admin/users", payload);
  return response.data;
};

export const deleteUserAsAdmin = async (userId) => {
  const response = await api.delete(`/admin/users/${userId}`);
  return response.data;
};

export const resetUserPassword = async (userId, newPassword) => {
  const response = await api.post(`/admin/users/${userId}/reset-password`, {
    newPassword
  });
  return response.data;
};

export const getProvinceAnalytics = async () => {
  const response = await api.get("/admin/province-analytics");
  return response.data;
};