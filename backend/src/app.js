require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const adminController = require("./controllers/adminController");

const prisma = new PrismaClient();
const app = express();

// Compose allowed origins from env (supports wildcard entries like https://*.vercel.app)
const envOriginsRaw = (process.env.CORS_ORIGIN || process.env.FRONTEND_URL || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const isAllowAll = envOriginsRaw.includes("*") || envOriginsRaw.includes("ALL");

const allowedOrigins = envOriginsRaw.length
  ? envOriginsRaw
  : [
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "http://localhost:3000",
      "https://carbon-calculator-yanga-dbvn.vercel.app",
      "https://carbon-calculator-yanga-cd622frhm-david-mtongas-projects.vercel.app",
    ];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (isAllowAll) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    // Allow subdomains if wildcard provided via env like https://*.vercel.app
    const wildcard = allowedOrigins.find((o) => o.includes("*"));
    if (wildcard) {
      try {
        const pattern = new RegExp(
          "^" + wildcard.replace(/[.+?^${}()|[\\]\\\\]/g, "\\$&").replace(/\\\\\*/g, ".*") + "$"
        );
        if (origin && pattern.test(origin)) return callback(null, true);
      } catch (_) {}
    }
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: false,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  // Let the cors package reflect requested headers by omitting allowedHeaders
  // If you prefer explicit, include common ones below
  allowedHeaders: undefined,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
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
    const { name, email, password, organization, province } = req.body;

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
        province: province || null,
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
        organization: user.organization,
        province: user.province,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Secure Admin registration with secret
app.post("/api/auth/register-admin", async (req, res) => {
  try {
    const { name, email, password, organization, province, adminSecret } = req.body;
    if (adminSecret !== process.env.ADMIN_REGISTRATION_SECRET) {
      return res.status(403).json({ error: "Invalid admin registration secret" });
    }

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        organization: organization || null,
        province: province || null,
        role: "ADMIN",
      },
    });

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
        organization: user.organization,
        province: user.province,
      },
    });
  } catch (error) {
    console.error("Admin registration error:", error);
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
        organization: user.organization,
        province: user.province,
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

// Offsets routes
app.post("/api/offsets", authenticateToken, async (req, res) => {
  try {
    const { amount, baselineCalculationId, improvedCalculationId, details } = req.body;

    if (amount === undefined || isNaN(parseFloat(amount)) || parseFloat(amount) < 0) {
      return res.status(400).json({ error: "Valid numeric 'amount' is required" });
    }

    const offset = await prisma.offset.create({
      data: {
        userId: req.user.id,
        amount: parseFloat(amount),
        baselineCalculationId: baselineCalculationId
          ? parseInt(baselineCalculationId)
          : null,
        improvedCalculationId: improvedCalculationId
          ? parseInt(improvedCalculationId)
          : null,
        details: details || null,
      },
    });

    res.status(201).json(offset);
  } catch (error) {
    console.error("Create offset error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/offsets", authenticateToken, async (req, res) => {
  try {
    const offsets = await prisma.offset.findMany({
      where: { userId: req.user.id },
      include: {
        baselineCalculation: {
          select: { id: true, type: true, emissions: true, carbonOffset: true, createdAt: true },
        },
        improvedCalculation: {
          select: { id: true, type: true, emissions: true, carbonOffset: true, createdAt: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(offsets);
  } catch (error) {
    console.error("Get offsets error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Admin routes
app.get("/api/admin/users", authenticateToken, (req, res, next) => {
  if (req.user.role !== "ADMIN") return res.sendStatus(403);
  return adminController.getAllUsers(req, res, next);
});

// Admin create user
app.post("/api/admin/users", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") return res.sendStatus(403);
    const { name, email, password, organization, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email and password are required" });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        organization: organization || null,
        role: role === "ADMIN" ? "ADMIN" : "USER",
      },
    });
    res.status(201).json(newUser);
  } catch (error) {
    console.error("Admin create user error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Admin delete user (cascades related records)
app.delete("/api/admin/users/:id", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") return res.sendStatus(403);
    const id = parseInt(req.params.id);

    // Remove related records first to avoid FK violations
    await prisma.offset.deleteMany({ where: { userId: id } });
    await prisma.calculation.deleteMany({ where: { userId: id } });
    await prisma.user.delete({ where: { id } });

    res.json({ success: true });
  } catch (error) {
    console.error("Admin delete user error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Admin reset user password
app.post("/api/admin/users/:id/reset-password", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") return res.sendStatus(403);
    const id = parseInt(req.params.id);
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters long" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id },
      data: { password: hashedPassword }
    });

    res.json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    console.error("Admin reset password error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/admin/calculations", authenticateToken, (req, res, next) => {
  if (req.user.role !== "ADMIN") return res.sendStatus(403);
  return adminController.getAllCalculations(req, res, next);
});

app.get("/api/admin/stats", authenticateToken, (req, res, next) => {
  if (req.user.role !== "ADMIN") return res.sendStatus(403);
  return adminController.getSystemStats(req, res, next);
});

app.get("/api/admin/export", authenticateToken, (req, res, next) => {
  if (req.user.role !== "ADMIN") return res.sendStatus(403);
  return adminController.exportData(req, res, next);
});

// Province analytics
app.get("/api/admin/province-analytics", authenticateToken, (req, res, next) => {
  if (req.user.role !== "ADMIN") return res.sendStatus(403);
  return adminController.getProvinceAnalytics(req, res, next);
});

module.exports = app;
