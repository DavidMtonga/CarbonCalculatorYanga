const express = require("express");
const router = express.Router();
const {
  authenticate,
  authorizeAdmin,
} = require("../middlewares/authMiddleware");
const adminController = require("../controllers/adminController");

router.use(authenticate);
router.use(authorizeAdmin);

router.get("/users", adminController.getAllUsers);
router.get("/calculations", adminController.getAllCalculations);
router.get("/stats", adminController.getSystemStats);
router.get("/export", adminController.exportData);

module.exports = router;
