const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/authenticate");
const { getLocationHistory, getViolationHistory, getViolationStats } = require("../controllers/historyController");

// Apply authentication to all routes
router.use(authenticate);

// Get location history for a vehicle
router.get("/:vehicleId", getLocationHistory);

// Get violation history for a vehicle
router.get("/:vehicleId/violations", getViolationHistory);

// Get violation statistics for a vehicle
router.get("/:vehicleId/stats", getViolationStats);

module.exports = router;
