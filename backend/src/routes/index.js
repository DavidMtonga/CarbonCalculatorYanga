const express = require("express");
const router = express.Router();
const authRoutes = require("./authRoutes");
const calculationRoutes = require("./calculationRoutes");
const adminRoutes = require("./adminRoutes");

router.use("/auth", authRoutes);
router.use("/calculations", calculationRoutes);
router.use("/admin", adminRoutes);

module.exports = router;
