const express = require("express");
const { updateLocation, getLocationHistory, getViolationHistory, getDashboardStats } = require("../controllers/locationController");
const { getVehicleComplianceStatus } = require("../controllers/geofenceController");
const authenticate = require("../middleware/authenticate");

const router = express.Router();

// Public route - for GPS devices
router.post("/", updateLocation);

// Private routes
router.get("/vehicles/:vehicleId/history", authenticate, getLocationHistory);
router.get("/vehicles/:vehicleId/violations", authenticate, getViolationHistory);
router.get("/vehicles/:vehicleId/compliance-status", authenticate, getVehicleComplianceStatus);
router.get("/stats/dashboard", authenticate, getDashboardStats);

module.exports = router;
