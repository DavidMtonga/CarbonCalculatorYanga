const API_BASE_URL = "http://localhost:3000/api";

// Save cooking calculation
export const saveCalculation = async (calculationData) => {
  try {
    console.log("Sending payload:", calculationData);

    const token = localStorage.getItem("token");
    if (!token) throw new Error("No authentication token found");

    if (!calculationData.type || calculationData.emissions === undefined) {
      throw new Error("Type and emissions are required fields");
    }

    // Create the payload that matches what the backend expects
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

    const response = await fetch(`${API_BASE_URL}/calculations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error("Backend validation error:", responseData);
      throw new Error(responseData.error || "Missing required fields");
    }

    return { data: responseData };
  } catch (error) {
    console.error("Error saving calculation:", error);
    throw error;
  }
};

export const getUserCalculations = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No authentication token found");

    const response = await fetch(`${API_BASE_URL}/calculations`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.error || "Failed to fetch calculations");
    }

    return responseData;
  } catch (error) {
    console.error("Error fetching calculations:", error);
    throw error;
  }
};

export const getDashboardData = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No authentication token found");

    const response = await fetch(`${API_BASE_URL}/calculations/dashboard`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.error || "Failed to fetch dashboard data");
    }

    return responseData.data;
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    throw error;
  }
};

export const deleteCalculation = async (id) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No authentication token found");

    const response = await fetch(`${API_BASE_URL}/calculations/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.error || "Failed to delete calculation");
    }

    return responseData;
  } catch (error) {
    console.error("Error deleting calculation:", error);
    throw error;
  }
};
