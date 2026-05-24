const Vehicle = require("../models/Vehicle");
const LocationLog = require("../models/LocationLog");
const Geofence = require("../models/Geofence");
const NotificationLog = require("../models/NotificationLog");
const { findViolatedGeofences, triggerN8NWebhook } = require("../utils/geofencing");
const { checkProvinceViolation } = require("../utils/provinceCheck");
const complianceManager = require("../utils/complianceManager");

/**
 * @route   POST /api/location
 * @desc    Receive GPS location from device and check for geofence violations
 * @access  Public (with deviceId validation in production)
 */
exports.updateLocation = async (req, res) => {
  try {
    const { deviceId, latitude, longitude, accuracy, speed, heading } = req.body;

    // Validate input
    if (!deviceId || latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        success: false,
        message: "Please provide deviceId, latitude, and longitude",
      });
    }

    // Find vehicle by deviceId
    let vehicle = await Vehicle.findOne({ deviceId });

    if (!vehicle || !vehicle.isActive) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found or inactive",
      });
    }

    // Update vehicle location
    vehicle.currentLocation = {
      type: "Point",
      coordinates: [longitude, latitude],
    };
    vehicle.lastUpdated = new Date();

    // Get all active geofences for this specific vehicle
    const geofences = await Geofence.find({
      userId: vehicle.userId,
      vehicleId: vehicle._id,
      isActive: true,
    });

    // Check for violations using type-specific methods
    let isViolation = false;
    let violatedGeofenceIds = [];
    let violationReasons = [];
    let isOutOfProvince = false;

    for (const geofence of geofences) {
      let isInGeofence = false;

      if (geofence.type === "polygon") {
        // Use Ray Casting for polygon geofences
        isInGeofence = isPointInPolygon([longitude, latitude], geofence.geometry.coordinates);
      } else if (geofence.type === "province") {
        // Use Turf.js for province geofences
        const provinceCheck = checkProvinceViolation(latitude, longitude, geofence.provinceName);
        isInGeofence = provinceCheck.isInside;

        if (!isInGeofence) {
          isOutOfProvince = true;
        }
      }

      // A geofence is violated if the point is OUTSIDE the geofence area
      if (!isInGeofence) {
        isViolation = true;
        violatedGeofenceIds.push(geofence._id);
        violationReasons.push(geofence.type === "province" ? "exited_province" : "exited_polygon");
      }
    }

    // Handle compliance state transitions
    let complianceAction = null;
    let notificationMessage = null;

    if (isViolation && violatedGeofenceIds.length > 0) {
      const violatedGeofence = geofences.find((g) => violatedGeofenceIds.includes(g._id));

      complianceAction = complianceManager.processViolation(vehicle);

      if (complianceAction.newStatus !== vehicle.status) {
        vehicle.status = complianceAction.newStatus;
        vehicle.isOutOfProvince = isOutOfProvince;

        if (complianceAction.newStatus === "warning") {
          vehicle.warningStartTime = complianceAction.warningStartTime || new Date();
        } else if (complianceAction.newStatus === "normal") {
          vehicle.warningStartTime = null;
        }
      }

      vehicle.lastViolationAt = new Date();
      notificationMessage = complianceAction.message;
    } else if (!isViolation && vehicle.status === "warning") {
      // Vehicle re-entered geofence area
      complianceAction = complianceManager.resetComplianceStatus(vehicle);
      vehicle.status = "normal";
      vehicle.warningStartTime = null;
      vehicle.isOutOfProvince = false;
      notificationMessage = complianceAction.message;
    }

    await vehicle.save();

    // Create location log with compliance status
    const locationLog = await LocationLog.create({
      vehicleId: vehicle._id,
      location: {
        type: "Point",
        coordinates: [longitude, latitude],
      },
      isViolation,
      violatedGeofences: violatedGeofenceIds,
      vehicleStatus: vehicle.status,
      violationReason: violationReasons.length > 0 ? violationReasons[0] : null,
      isOutOfProvince,
      accuracy: accuracy || null,
      speed: speed || null,
      heading: heading || null,
    });

    // Handle violations and notifications
    if ((isViolation || complianceAction) && complianceManager.shouldSendNotification(vehicle)) {
      await handleViolation(vehicle, violatedGeofenceIds, locationLog, notificationMessage, complianceAction);
      vehicle.lastNotificationAt = new Date();
      await vehicle.save();
    }

    res.status(200).json({
      success: true,
      message: "Location updated successfully",
      data: {
        vehicleId: vehicle._id,
        location: vehicle.currentLocation.coordinates,
        status: vehicle.status,
        isViolation,
        violatedGeofences: violatedGeofenceIds,
        timestamp: new Date(),
      },
    });
  } catch (error) {
    console.error("Update location error:", error);
    res.status(500).json({
      success: false,
      message: `Failed to update location: ${error.message}`,
    });
  }
};

const isPointInPolygon = (point, polygon) => {
  const [lon, lat] = point;
  const exterior = polygon[0];

  let isInside = false;

  for (let i = 0, j = exterior.length - 1; i < exterior.length; j = i++) {
    const xi = exterior[i][0],
      yi = exterior[i][1];
    const xj = exterior[j][0],
      yj = exterior[j][1];

    const intersect = yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;

    if (intersect) isInside = !isInside;
  }

  return isInside;
};

/**
 * Handle geofence violation - create notifications and trigger N8N webhook
 *
 * @param {object} vehicle - Vehicle document
 * @param {array} violatedGeofenceIds - IDs of violated geofences
 * @param {object} locationLog - Location log document
 * @param {string} notificationMessage - Custom message for this violation
 * @param {object} complianceAction - Compliance action taken
 */
const handleViolation = async (vehicle, violatedGeofenceIds, locationLog, notificationMessage, complianceAction) => {
  try {
    // Get violated geofence details
    const violatedGeofences = await Geofence.find({
      _id: { $in: violatedGeofenceIds },
    });

    // Get user
    const user = await require("../models/User").findById(vehicle.userId);

    // Create notifications for each violation
    for (const geofence of violatedGeofences) {
      let message = notificationMessage || `Vehicle exited ${geofence.name}`;

      const violationData = {
        vehicleId: vehicle._id,
        vehicleName: vehicle.vehicleName,
        geofenceId: geofence._id,
        geofenceName: geofence.name,
        geofenceType: geofence.type,
        provinceName: geofence.provinceName || null,
        location: locationLog.location.coordinates,
        timestamp: new Date(),
        userId: vehicle.userId,
        vehicleStatus: vehicle.status,
        complianceAction: complianceAction?.action || "violation_detected",
      };

      // Create notification logs for enabled channels
      if (user.notifConfig.email) {
        await NotificationLog.create({
          vehicleId: vehicle._id,
          geofenceId: geofence._id,
          userId: vehicle.userId,
          channel: "email",
          status: "pending",
          message,
          violationDetails: {
            vehicleName: vehicle.vehicleName,
            geofenceName: geofence.name,
            geofenceType: geofence.type,
            location: locationLog.location,
            vehicleStatus: vehicle.status,
          },
        });
      }

      if (user.notifConfig.telegram && user.notifConfig.telegramChatId) {
        await NotificationLog.create({
          vehicleId: vehicle._id,
          geofenceId: geofence._id,
          userId: vehicle.userId,
          channel: "telegram",
          status: "pending",
          message,
          violationDetails: {
            vehicleName: vehicle.vehicleName,
            geofenceName: geofence.name,
            geofenceType: geofence.type,
            location: locationLog.location,
            vehicleStatus: vehicle.status,
          },
        });
      }

      if (user.notifConfig.whatsapp && user.notifConfig.whatsappPhone) {
        await NotificationLog.create({
          vehicleId: vehicle._id,
          geofenceId: geofence._id,
          userId: vehicle.userId,
          channel: "whatsapp",
          status: "pending",
          message,
          violationDetails: {
            vehicleName: vehicle.vehicleName,
            geofenceName: geofence.name,
            geofenceType: geofence.type,
            location: locationLog.location,
            vehicleStatus: vehicle.status,
          },
        });
      }

      // Trigger N8N webhook
      try {
        await triggerN8NWebhook(violationData);

        // Update notification status
        await NotificationLog.updateMany(
          {
            vehicleId: vehicle._id,
            geofenceId: geofence._id,
            status: "pending",
          },
          { status: "sent", sentAt: new Date() },
        );
      } catch (error) {
        console.error("N8N webhook error:", error.message);

        // Log webhook failure
        await NotificationLog.updateMany(
          {
            vehicleId: vehicle._id,
            geofenceId: geofence._id,
            status: "pending",
          },
          { status: "failed", errorMessage: error.message },
        );
      }
    }
  } catch (error) {
    console.error("Handle violation error:", error);
  }
};

/**
 * @route   GET /api/vehicles/:vehicleId/locations
 * @desc    Get location history for a vehicle
 * @access  Private
 */
exports.getLocationHistory = async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const { limit = 100, offset = 0 } = req.query;

    // Check vehicle ownership
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
        message: "Not authorized to access this vehicle",
      });
    }

    const locations = await LocationLog.find({ vehicleId }).sort({ timestamp: -1 }).limit(parseInt(limit)).skip(parseInt(offset));

    const total = await LocationLog.countDocuments({ vehicleId });

    res.status(200).json({
      success: true,
      count: locations.length,
      total,
      locations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to fetch location history: ${error.message}`,
    });
  }
};

/**
 * @route   GET /api/vehicles/:vehicleId/violations
 * @desc    Get violation history for a vehicle
 * @access  Private
 */
exports.getViolationHistory = async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    // Check vehicle ownership
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
        message: "Not authorized to access this vehicle",
      });
    }

    const violations = await LocationLog.find({
      vehicleId,
      isViolation: true,
    })
      .populate("violatedGeofences", "name")
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));

    const total = await LocationLog.countDocuments({
      vehicleId,
      isViolation: true,
    });

    res.status(200).json({
      success: true,
      count: violations.length,
      total,
      violations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to fetch violation history: ${error.message}`,
    });
  }
};

/**
 * @route   GET /api/dashboard-stats
 * @desc    Get dashboard statistics
 * @access  Private
 */
exports.getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;

    // Total vehicles
    const totalVehicles = await Vehicle.countDocuments({ userId });

    // Active vehicles
    const activeVehicles = await Vehicle.countDocuments({ userId, isActive: true });

    // Total geofences
    const totalGeofences = await Geofence.countDocuments({ userId });

    // Today's violations
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayViolations = await LocationLog.countDocuments({
      vehicleId: { $in: await Vehicle.find({ userId }).select("_id") },
      isViolation: true,
      createdAt: { $gte: today },
    });

    res.status(200).json({
      success: true,
      stats: {
        totalVehicles,
        activeVehicles,
        totalGeofences,
        todayViolations,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to fetch dashboard stats: ${error.message}`,
    });
  }
};
