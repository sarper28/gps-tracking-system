const express = require("express");
const { createVehicle, getVehicles, getVehicle, updateVehicle, deleteVehicle } = require("../controllers/vehicleController");
const authenticate = require("../middleware/authenticate");

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.post("/", createVehicle);
router.get("/", getVehicles);
router.get("/:id", getVehicle);
router.put("/:id", updateVehicle);
router.delete("/:id", deleteVehicle);

module.exports = router;
