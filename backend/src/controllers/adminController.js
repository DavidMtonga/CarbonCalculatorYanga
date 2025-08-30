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
        province: true,
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
    const totalCalculations = await prisma.calculation.count();
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
      totalCalculations,
      activeUsers,
      totalEmissions: emissionsAgg._sum.emissions || 0,
      totalOffsets: offsetAgg._sum.carbonOffset || 0,
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

const getProvinceAnalytics = async (req, res, next) => {
  try {
    // Get all provinces with user counts and calculations
    const provinceData = await prisma.user.groupBy({
      by: ['province'],
      _count: {
        id: true,
      },
      where: {
        province: {
          not: null,
        },
      },
    });

    // Get emissions and offsets by province
    const provinceCalculations = await prisma.calculation.groupBy({
      by: ['user'],
      _sum: {
        emissions: true,
        carbonOffset: true,
      },
      where: {
        user: {
          province: {
            not: null,
          },
        },
      },
    });

    // Get user details for calculations
    const usersWithCalculations = await prisma.user.findMany({
      where: {
        id: {
          in: provinceCalculations.map(c => c.user),
        },
      },
      select: {
        id: true,
        province: true,
      },
    });

    // Create a map of user ID to province
    const userProvinceMap = {};
    usersWithCalculations.forEach(user => {
      userProvinceMap[user.id] = user.province;
    });

    // Aggregate calculations by province
    const provinceStats = {};
    provinceCalculations.forEach(calc => {
      const province = userProvinceMap[calc.user];
      if (province) {
        if (!provinceStats[province]) {
          provinceStats[province] = {
            totalEmissions: 0,
            totalOffsets: 0,
          };
        }
        provinceStats[province].totalEmissions += calc._sum.emissions || 0;
        provinceStats[province].totalOffsets += calc._sum.carbonOffset || 0;
      }
    });

    // Combine data
    const provinces = provinceData.map(province => ({
      name: province.province,
      userCount: province._count.id,
      totalEmissions: (provinceStats[province.province]?.totalEmissions || 0) / 1000, // Convert to tonnes
      totalOffsets: (provinceStats[province.province]?.totalOffsets || 0) / 1000, // Convert to tonnes
    }));

    // Get overall totals
    const totalEmissions = provinces.reduce((sum, p) => sum + p.totalEmissions, 0);
    const totalOffsets = provinces.reduce((sum, p) => sum + p.totalOffsets, 0);

    res.json({
      provinces,
      totalEmissions,
      totalOffsets,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  getAllCalculations,
  getSystemStats,
  exportData,
  getProvinceAnalytics,
};
