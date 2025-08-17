import prisma from "../config/prisma.js";

export const saveCalculation = async (userId, calculationData) => {
  try {
    console.log("Saving calculation data:", { userId, calculationData });

    // Validate that 'type' exists and 'emissions' is a valid number
    if (!calculationData.type || isNaN(parseFloat(calculationData.emissions))) {
      throw new Error(
        "Missing or invalid required fields: 'type' and a numeric 'emissions' value are required."
      );
    }

    const calculation = await prisma.calculation.create({
      data: {
        userId: parseInt(userId),
        type: calculationData.type.toUpperCase(), // Ensure uppercase for enum
        emissions: parseFloat(calculationData.emissions) || 0,
        carbonOffset: parseFloat(calculationData.carbonOffset) || 0,

        // Only include cooking-specific fields as per your schema
        // This is the key change: we now access the nested 'data' object.
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
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    console.log("Calculation saved successfully:", calculation.id);
    return calculation;
  } catch (error) {
    console.error("Error in saveCalculation service:", error);
    throw error;
  }
};

export const getUserCalculations = async (userId) => {
  try {
    console.log("Fetching calculations for user:", userId);

    const calculations = await prisma.calculation.findMany({
      where: {
        userId: parseInt(userId),
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return calculations;
  } catch (error) {
    console.error("Error in getUserCalculations service:", error);
    throw error;
  }
};

export const getCalculationById = async (id, userId) => {
  try {
    const calculation = await prisma.calculation.findFirst({
      where: {
        id: parseInt(id),
        userId: parseInt(userId),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return calculation;
  } catch (error) {
    console.error("Error in getCalculationById service:", error);
    throw error;
  }
};

export const deleteCalculation = async (id, userId) => {
  try {
    const calculation = await prisma.calculation.deleteMany({
      where: {
        id: parseInt(id),
        userId: parseInt(userId),
      },
    });

    return calculation;
  } catch (error) {
    console.error("Error in deleteCalculation service:", error);
    throw error;
  }
};

export const getDashboardData = async (userId) => {
  try {
    console.log("Fetching dashboard data for user:", userId);

    // Get all calculations for the user
    const calculations = await prisma.calculation.findMany({
      where: {
        userId: parseInt(userId),
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Calculate summary statistics
    const totalEmissions = calculations.reduce(
      (sum, calc) => sum + (calc.emissions || 0),
      0
    );
    const totalOffset = calculations.reduce(
      (sum, calc) => sum + (calc.carbonOffset || 0),
      0
    );
    const netEmissions = totalEmissions - totalOffset;
    const avgEmissions =
      calculations.length > 0 ? totalEmissions / calculations.length : 0;

    // Get calculations by type
    const calculationsByType = calculations.reduce((acc, calc) => {
      const type = calc.type.toLowerCase();
      if (!acc[type]) {
        acc[type] = {
          count: 0,
          totalEmissions: 0,
          totalOffset: 0,
        };
      }
      acc[type].count++;
      acc[type].totalEmissions += calc.emissions || 0;
      acc[type].totalOffset += calc.carbonOffset || 0;
      return acc;
    }, {});

    // Get recent calculations (last 5)
    const recentCalculations = calculations.slice(0, 5);

    return {
      summary: {
        totalEmissions: parseFloat(totalEmissions.toFixed(2)),
        totalOffset: parseFloat(totalOffset.toFixed(2)),
        netEmissions: parseFloat(netEmissions.toFixed(2)),
        avgEmissions: parseFloat(avgEmissions.toFixed(2)),
        totalCalculations: calculations.length,
      },
      byType: calculationsByType,
      recent: recentCalculations,
      all: calculations,
    };
  } catch (error) {
    console.error("Error in getDashboardData service:", error);
    throw error;
  }
};
