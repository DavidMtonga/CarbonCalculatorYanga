import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import { saveCalculation } from "../services/calculationService.js";

export const createCalculation = async (req, res, next) => {
  try {
    const { type, emissions } = req.body;
    const userId = req.user.id;

    // Validate required fields at the controller level
    if (!type || emissions === undefined || emissions === null) {
      return next(new ApiError(400, "Type and emissions are required fields"));
    }

    // Pass the entire request body directly to the service
    // The service is responsible for handling the specific fields
    const calculation = await saveCalculation(userId, req.body);

    res
      .status(201)
      .json(
        new ApiResponse(201, calculation, "Calculation saved successfully")
      );
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

export const getUserCalculations = async (req, res, next) => {
  try {
    const calculations = await prisma.calculation.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
    });

    res
      .status(200)
      .json(
        new ApiResponse(200, calculations, "Calculations fetched successfully")
      );
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

export const getDashboardData = async (req, res, next) => {
  try {
    const calculations = await prisma.calculation.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
    });

    const totalEmissions = calculations.reduce(
      (sum, calc) => sum + calc.emissions,
      0
    );
    const totalOffset = calculations.reduce(
      (sum, calc) => sum + calc.carbonOffset,
      0
    );

    const dashboardData = {
      totalEmissions,
      totalOffset,
      netEmissions: totalEmissions - totalOffset,
      calculationCount: calculations.length,
      recentCalculations: calculations.slice(0, 5),
    };

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          dashboardData,
          "Dashboard data fetched successfully"
        )
      );
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

export const deleteCalculation = async (req, res, next) => {
  try {
    const { id } = req.params;

    const calculation = await prisma.calculation.findUnique({
      where: { id: parseInt(id) },
    });

    if (!calculation || calculation.userId !== req.user.id) {
      return next(new ApiError(404, "Calculation not found"));
    }

    await prisma.calculation.delete({
      where: { id: parseInt(id) },
    });

    res
      .status(200)
      .json(new ApiResponse(200, null, "Calculation deleted successfully"));
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};
