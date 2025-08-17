require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Routes
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password, organization } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "Email already in use" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        organization: organization || null,
        role: "USER",
      },
    });

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Check password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Protected routes
app.post("/api/calculations", authenticateToken, async (req, res) => {
  try {
    const { type, data, emissions, carbonOffset } = req.body;

    // Validate input
    if (
      !type ||
      !data ||
      emissions === undefined ||
      carbonOffset === undefined
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Create calculation
    const calculation = await prisma.calculation.create({
      data: {
        userId: req.user.id,
        type: type.toUpperCase(),
        emissions: parseFloat(emissions),
        carbonOffset: parseFloat(carbonOffset),
        cookingDuration: data.cookingDuration
          ? parseFloat(data.cookingDuration)
          : null,
        cookingMeals: data.cookingMeals ? parseInt(data.cookingMeals) : null,
        fuelType: data.fuelType || null,
        charcoalUsed: data.charcoalUsed ? parseFloat(data.charcoalUsed) : null,
      },
    });

    res.json(calculation);
  } catch (error) {
    console.error("Calculation error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/calculations", authenticateToken, async (req, res) => {
  try {
    const calculations = await prisma.calculation.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
    });
    res.json(calculations);
  } catch (error) {
    console.error("Get calculations error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Admin routes
app.get("/api/admin/users", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") return res.sendStatus(403);

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
    console.error("Get users error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/admin/calculations", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") return res.sendStatus(403);

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
    console.error("Get all calculations error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/admin/stats", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") return res.sendStatus(403);

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
    console.error("Get stats error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/admin/export", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") return res.sendStatus(403);

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
      offset: c.carbonOffset,
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
        "Offset (kg CO₂e)",
        "Date",
      ],
      ...csvData.map((item) => [
        item.id,
        `"${item.userName}"`,
        item.userEmail,
        `"${item.userOrganization}"`,
        item.type,
        item.emissions,
        item.offset,
        item.createdAt,
      ]),
    ]
      .map((e) => e.join(","))
      .join("\n");

    res.send(csvString);
  } catch (error) {
    console.error("Export error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = app;
