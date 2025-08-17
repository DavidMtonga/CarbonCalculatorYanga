import express from "express";
import {
  createCalculation,
  getUserCalculations,
  deleteCalculation,
  getDashboardData,
} from "../controllers/calculationController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createCalculation);
router.get("/", protect, getUserCalculations);
router.get("/dashboard", protect, getDashboardData);
router.delete("/:id", protect, deleteCalculation);

export default router;
