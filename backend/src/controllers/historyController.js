const LocationLog = require("../models/LocationLog");
const Vehicle = require("../models/Vehicle");

// Get location history with pagination
exports.getLocationHistory = async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Verify vehicle exists and belongs to user
    const vehicle = await Vehicle.findById(vehicleId);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    }

    if (vehicle.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this vehicle's history",
      });
    }

    // Fetch location history sorted by newest first
    const locationLogs = await LocationLog.find({ vehicleId }).sort({ timestamp: -1 }).limit(limit).skip(skip).populate("violatedGeofences", "name description");

    // Get total count
    const totalItems = await LocationLog.countDocuments({ vehicleId });
    const totalPages = Math.ceil(totalItems / limit);

    return res.status(200).json({
      success: true,
      message: "Location history retrieved successfully",
      data: locationLogs,
      pagination: {
        currentPage: page,
        pageSize: limit,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching location history:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Get violation history with pagination
exports.getViolationHistory = async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Verify vehicle exists and belongs to user
    const vehicle = await Vehicle.findById(vehicleId);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    }

    if (vehicle.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this vehicle's violation history",
      });
    }

    // Fetch only violation records sorted by newest first
    const violations = await LocationLog.find({
      vehicleId,
      isViolation: true,
    })
      .sort({ timestamp: -1 })
      .limit(limit)
      .skip(skip)
      .populate("violatedGeofences", "name description");

    // Get total violation count
    const totalItems = await LocationLog.countDocuments({
      vehicleId,
      isViolation: true,
    });
    const totalPages = Math.ceil(totalItems / limit);

    return res.status(200).json({
      success: true,
      message: "Violation history retrieved successfully",
      data: violations,
      pagination: {
        currentPage: page,
        pageSize: limit,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching violation history:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Get violation statistics for a vehicle
exports.getViolationStats = async (req, res) => {
  try {
    const { vehicleId } = req.params;

    // Verify vehicle exists and belongs to user
    const vehicle = await Vehicle.findById(vehicleId);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    }

    if (vehicle.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this vehicle's statistics",
      });
    }

    const totalLocations = await LocationLog.countDocuments({ vehicleId });
    const totalViolations = await LocationLog.countDocuments({
      vehicleId,
      isViolation: true,
    });

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayViolations = await LocationLog.countDocuments({
      vehicleId,
      isViolation: true,
      timestamp: { $gte: todayStart },
    });

    return res.status(200).json({
      success: true,
      message: "Violation statistics retrieved successfully",
      data: {
        totalLocations,
        totalViolations,
        todayViolations,
        violationPercentage: totalLocations > 0 ? ((totalViolations / totalLocations) * 100).toFixed(2) : 0,
      },
    });
  } catch (error) {
    console.error("Error fetching violation statistics:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
