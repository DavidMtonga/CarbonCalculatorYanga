// backend/src/controllers/offsetController.js
const ApiError = require("../utils/apiError");
const ApiResponse = require("../utils/apiResponse");
const asyncHandler = require("../middleware/asyncHandler");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const createUserOffset = asyncHandler(async (req, res) => {
  const { amount, projectId, calculationId } = req.body;
  const userId = req.user.id;

  // Validate required fields
  if (!amount || amount <= 0) {
    throw ApiError.badRequest("Valid amount is required");
  }

  // Create offset
  const offset = await prisma.offset.create({
    data: {
      userId,
      amount,
      projectId: projectId || null,
      calculationId: calculationId || null,
    },
  });

  const response = new ApiResponse(201, offset, "Offset created successfully");
  res.status(response.statusCode).json(response.toJSON());
});

const getUserOffsets = asyncHandler(async (req, res) => {
  const offsets = await prisma.offset.findMany({
    where: { userId: req.user.id },
    include: {
      project: {
        select: {
          name: true,
          type: true,
          location: true,
        },
      },
      calculation: {
        select: {
          type: true,
          emissions: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const response = new ApiResponse(
    200,
    offsets,
    "Offsets fetched successfully"
  );
  res.status(response.statusCode).json(response.toJSON());
});

module.exports = {
  createUserOffset,
  getUserOffsets,
};
