const express = require("express");
const { createGeofence, getGeofences, getGeofence, updateGeofence, deleteGeofence, getProvinces, getProvinceGeometryEndpoint, getVehicleComplianceStatus } = require("../controllers/geofenceController");
const authenticate = require("../middleware/authenticate");

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.get("/provinces", getProvinces);
router.get("/provinces/:provinceName/geometry", getProvinceGeometryEndpoint);

router.post("/", createGeofence);
router.get("/", getGeofences);
router.get("/:id", getGeofence);
router.put("/:id", updateGeofence);
router.delete("/:id", deleteGeofence);

module.exports = router;
