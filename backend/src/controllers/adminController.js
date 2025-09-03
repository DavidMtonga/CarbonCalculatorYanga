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
            province: true,
          },
        },
        offsetsAsBaseline: { select: { amount: true } },
        offsetsAsImproved: { select: { amount: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const withRecordedOffsets = calculations.map((c) => {
      const baselineSum = (c.offsetsAsBaseline || []).reduce((s, o) => s + (o.amount || 0), 0);
      const improvedSum = (c.offsetsAsImproved || []).reduce((s, o) => s + (o.amount || 0), 0);
      const recordedOffset = baselineSum + improvedSum;
      const totalOffset = (c.carbonOffset || 0) + recordedOffset;
      const { offsetsAsBaseline, offsetsAsImproved, ...rest } = c;
      return { ...rest, recordedOffset, totalOffset };
    });

    res.json(withRecordedOffsets);
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

    const calcOffsetAgg = await prisma.calculation.aggregate({
      _sum: { carbonOffset: true },
    });
    const recordedOffsetAgg = await prisma.offset.aggregate({
      _sum: { amount: true },
    });

    res.json({
      totalUsers,
      totalCalculations,
      activeUsers,
      totalEmissions: emissionsAgg._sum.emissions || 0,
      totalOffsets:
        (calcOffsetAgg._sum.carbonOffset || 0) +
        (recordedOffsetAgg._sum.amount || 0),
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
        offsetsAsBaseline: { select: { amount: true } },
        offsetsAsImproved: { select: { amount: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const rows = calculations.map((c) => {
      const baselineSum = (c.offsetsAsBaseline || []).reduce((s, o) => s + (o.amount || 0), 0);
      const improvedSum = (c.offsetsAsImproved || []).reduce((s, o) => s + (o.amount || 0), 0);
      const recordedOffset = baselineSum + improvedSum;
      const totalOffset = (c.carbonOffset || 0) + recordedOffset;
      return {
      id: c.id,
      userName: c.user.name,
      userEmail: c.user.email,
      userOrganization: c.user.organization || "",
      type: c.type,
      emissions: c.emissions,
        calcOffset: c.carbonOffset,
        recordedOffset,
        totalOffset,
      createdAt: c.createdAt.toISOString(),
      };
    });

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=calculations.csv"
    );

    const csvString = [
      [
        "ID",
        "User Name",
        "User Email",
        "Organization",
        "Calculation Type",
        "Emissions (kg CO₂e)",
        "Calc Offset (kg CO₂e)",
        "Recorded Offsets (kg CO₂e)",
        "Total Offset (kg CO₂e)",
        "Date",
      ],
      ...rows.map((item) => [
        item.id,
        `"${item.userName}"`,
        item.userEmail,
        `"${item.userOrganization}"`,
        item.type,
        item.emissions,
        item.calcOffset,
        item.recordedOffset,
        item.totalOffset,
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
    // User counts by province
    const provinceUsers = await prisma.user.groupBy({
      by: ['province'],
      _count: { id: true },
      where: { province: { not: null } },
    });

    // Emissions and calc offsets per province via Calculation joined with User
    const calcAgg = await prisma.calculation.groupBy({
      by: ['userId'],
      _sum: { emissions: true, carbonOffset: true },
    });

    const userIds = calcAgg.map(c => c.userId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, province: true },
    });
    const userProvince = Object.fromEntries(users.map(u => [u.id, u.province]));

    const provinceTotals = {};
    calcAgg.forEach(c => {
      const province = userProvince[c.userId];
      if (!province) return;
      if (!provinceTotals[province]) {
        provinceTotals[province] = { emissions: 0, calcOffset: 0 };
      }
      provinceTotals[province].emissions += c._sum.emissions || 0;
      provinceTotals[province].calcOffset += c._sum.carbonOffset || 0;
    });

    // Recorded offsets per province via Offset joined with User
    const offsetAgg = await prisma.offset.groupBy({
      by: ['userId'],
      _sum: { amount: true },
    });
    const offsetUserIds = offsetAgg.map(o => o.userId);
    const offsetUsers = await prisma.user.findMany({
      where: { id: { in: offsetUserIds } },
      select: { id: true, province: true },
    });
    const offsetUserProvince = Object.fromEntries(offsetUsers.map(u => [u.id, u.province]));
    offsetAgg.forEach(o => {
      const province = offsetUserProvince[o.userId];
      if (!province) return;
      if (!provinceTotals[province]) provinceTotals[province] = { emissions: 0, calcOffset: 0 };
      provinceTotals[province].calcOffset += o._sum.amount || 0;
    });

    const provinces = provinceUsers.map(pu => {
      const totals = provinceTotals[pu.province] || { emissions: 0, calcOffset: 0 };
      return {
        name: pu.province,
        userCount: pu._count.id,
        totalEmissions: (totals.emissions || 0) / 1000,
        totalOffsets: (totals.calcOffset || 0) / 1000,
      };
    });

    const totalEmissions = provinces.reduce((s, p) => s + (p.totalEmissions || 0), 0);
    const totalOffsets = provinces.reduce((s, p) => s + (p.totalOffsets || 0), 0);

    res.json({ provinces, totalEmissions, totalOffsets });
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
