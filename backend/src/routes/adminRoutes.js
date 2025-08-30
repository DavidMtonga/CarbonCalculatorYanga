const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const authMiddleware = require("../middlewares/authMiddleware");

// Apply auth middleware to all admin routes
router.use(authMiddleware.requireAuth);
router.use(authMiddleware.requireAdmin);

// Admin routes
router.get("/users", adminController.getAllUsers);
router.get("/calculations", adminController.getAllCalculations);
router.get("/stats", adminController.getSystemStats);
router.get("/export", adminController.exportData);
router.get("/province-analytics", adminController.getProvinceAnalytics);

module.exports = router;
