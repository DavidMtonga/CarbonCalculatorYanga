const { PrismaClient } = require("@prisma/client");
const ApiError = require("../utils/apiError");
const prisma = new PrismaClient();

const getAllUsers = async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        organization: true,
        role: true,
        lastLogin: true,
        createdAt: true,
        _count: {
          select: { calculations: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(users);
  } catch (error) {
    next(error);
  }
};

const getAllCalculations = async (req, res, next) => {
  try {
    const calculations = await prisma.calculation.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    res.json(calculations);
  } catch (error) {
    next(error);
  }
};

const getSystemStats = async (req, res, next) => {
  try {
    const totalUsers = await prisma.user.count();
    const activeUsers = await prisma.user.count({
      where: {
        lastLogin: {
          gte: new Date(new Date() - 30 * 24 * 60 * 60 * 1000),
        },
      },
    });

    const emissionsAgg = await prisma.calculation.aggregate({
      _sum: { emissions: true },
    });

    const offsetAgg = await prisma.calculation.aggregate({
      _sum: { carbonOffset: true },
    });

    res.json({
      totalUsers,
      activeUsers,
      totalEmissions: emissionsAgg._sum.emissions || 0,
      totalOffset: offsetAgg._sum.carbonOffset || 0,
    });
  } catch (error) {
    next(error);
  }
};

const exportData = async (req, res, next) => {
  try {
    const calculations = await prisma.calculation.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
            organization: true,
          },
        },
      },
    });

    // Convert to CSV
    const csvData = calculations.map((c) => ({
      id: c.id,
      userName: c.user.name,
      userEmail: c.user.email,
      userOrganization: c.user.organization || "",
      type: c.type,
      emissions: c.emissions,
      carbonOffset: c.carbonOffset,
      createdAt: c.createdAt.toISOString(),
    }));

    // Set headers for CSV download
    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=calculations.csv"
    );

    // Convert to CSV
    const csvString = [
      [
        "ID",
        "User Name",
        "User Email",
        "Organization",
        "Calculation Type",
        "Emissions (kg CO₂e)",
        "Carbon Offset (kg CO₂e)",
        "Date",
      ],
      ...csvData.map((item) => [
        item.id,
        `"${item.userName}"`,
        item.userEmail,
        `"${item.userOrganization}"`,
        item.type,
        item.emissions,
        item.carbonOffset,
        item.createdAt,
      ]),
    ]
      .map((e) => e.join(","))
      .join("\n");

    res.send(csvString);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  getAllCalculations,
  getSystemStats,
  exportData,
};
