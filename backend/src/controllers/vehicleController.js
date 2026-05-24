const Vehicle = require("../models/Vehicle");

/**
 * @route   POST /api/vehicles
 * @desc    Create a new vehicle
 * @access  Private
 */
exports.createVehicle = async (req, res) => {
  try {
    const { vehicleName, deviceId, licensePlate } = req.body;

    // Validate input
    if (!vehicleName || !deviceId || !licensePlate) {
      return res.status(400).json({
        success: false,
        message: "Please provide vehicleName, deviceId, and licensePlate",
      });
    }

    // Check if deviceId already exists
    const existingVehicle = await Vehicle.findOne({ deviceId });
    if (existingVehicle) {
      return res.status(409).json({
        success: false,
        message: "Device ID already exists",
      });
    }

    // Check if licensePlate already exists
    const existingPlate = await Vehicle.findOne({ licensePlate });
    if (existingPlate) {
      return res.status(409).json({
        success: false,
        message: "License plate already exists",
      });
    }

    // Create vehicle
    const vehicle = await Vehicle.create({
      userId: req.user._id,
      vehicleName,
      deviceId,
      licensePlate,
      currentLocation: {
        type: "Point",
        coordinates: [0, 0], // Default location
      },
    });

    res.status(201).json({
      success: true,
      message: "Vehicle created successfully",
      vehicle,
    });
  } catch (error) {
    console.error("Create vehicle error:", error);
    res.status(500).json({
      success: false,
      message: `Failed to create vehicle: ${error.message}`,
    });
  }
};

/**
 * @route   GET /api/vehicles
 * @desc    Get all vehicles for logged-in user
 * @access  Private
 */
exports.getVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ userId: req.user._id }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: vehicles.length,
      vehicles,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to fetch vehicles: ${error.message}`,
    });
  }
};

/**
 * @route   GET /api/vehicles/:id
 * @desc    Get single vehicle
 * @access  Private
 */
exports.getVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    }

    // Check ownership
    if (vehicle.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this vehicle",
      });
    }

    res.status(200).json({
      success: true,
      vehicle,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to fetch vehicle: ${error.message}`,
    });
  }
};

/**
 * @route   PUT /api/vehicles/:id
 * @desc    Update vehicle
 * @access  Private
 */
exports.updateVehicle = async (req, res) => {
  try {
    const { vehicleName, licensePlate, isActive } = req.body;

    let vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    }

    // Check ownership
    if (vehicle.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this vehicle",
      });
    }

    // Check if new licensePlate is unique (if being updated)
    if (licensePlate && licensePlate !== vehicle.licensePlate) {
      const existingPlate = await Vehicle.findOne({ licensePlate });
      if (existingPlate) {
        return res.status(409).json({
          success: false,
          message: "License plate already exists",
        });
      }
    }

    // Update fields
    if (vehicleName) vehicle.vehicleName = vehicleName;
    if (licensePlate) vehicle.licensePlate = licensePlate;
    if (isActive !== undefined) vehicle.isActive = isActive;

    vehicle = await vehicle.save();

    res.status(200).json({
      success: true,
      message: "Vehicle updated successfully",
      vehicle,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to update vehicle: ${error.message}`,
    });
  }
};

/**
 * @route   DELETE /api/vehicles/:id
 * @desc    Delete vehicle
 * @access  Private
 */
exports.deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    }

    // Check ownership
    if (vehicle.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this vehicle",
      });
    }

    await Vehicle.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Vehicle deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to delete vehicle: ${error.message}`,
    });
  }
};
