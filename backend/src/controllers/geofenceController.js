const Geofence = require("../models/Geofence");
const { loadProvinceList, getProvinceGeometry } = require("../utils/provinceCheck");

/**
 * @route   POST /api/geofences
 * @desc    Create a new geofence (polygon or province)
 * @access  Private
 */
exports.createGeofence = async (req, res) => {
  try {
    const { name, description, type, coordinates, provinceName, vehicleId, isActive } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Please provide a geofence name",
      });
    }

    if (!vehicleId) {
      return res.status(400).json({
        success: false,
        message: "Please provide a vehicle ID",
      });
    }

    // Verify vehicle exists and belongs to user
    const Vehicle = require("../models/Vehicle");
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
        message: "Not authorized to create geofence for this vehicle",
      });
    }

    let geofenceData = {
      userId: req.user._id,
      vehicleId,
      name,
      description: description || "",
      type: type || "polygon",
      isActive: isActive !== undefined ? isActive : true,
    };

    if (type === "province") {
      if (!provinceName) {
        return res.status(400).json({
          success: false,
          message: "Please provide a province name",
        });
      }

      const geometry = getProvinceGeometry(provinceName);

      if (!geometry) {
        return res.status(400).json({
          success: false,
          message: "Invalid province name",
        });
      }

      geofenceData.provinceName = provinceName;
      geofenceData.geometry = geometry;
    } else if (type === "polygon") {
      if (!coordinates || coordinates.length < 3) {
        return res.status(400).json({
          success: false,
          message: "Please provide polygon coordinates with at least 3 vertices",
        });
      }

      geofenceData.geometry = {
        type: "Polygon",
        coordinates: [coordinates],
      };
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid geofence type. Use 'polygon' or 'province'",
      });
    }

    const geofence = await Geofence.create(geofenceData);

    res.status(201).json({
      success: true,
      message: "Geofence created successfully",
      geofence,
    });
  } catch (error) {
    console.error("Create geofence error:", error);
    res.status(500).json({
      success: false,
      message: `Failed to create geofence: ${error.message}`,
    });
  }
};

/**
 * @route   GET /api/geofences
 * @desc    Get all geofences for logged-in user
 * @access  Private
 */
exports.getGeofences = async (req, res) => {
  try {
    const { vehicleId } = req.query;

    let query = { userId: req.user._id };
    if (vehicleId) {
      query.vehicleId = vehicleId;
    }

    const geofences = await Geofence.find(query).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: geofences.length,
      geofences,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to fetch geofences: ${error.message}`,
    });
  }
};

/**
 * @route   GET /api/geofences/:id
 * @desc    Get single geofence
 * @access  Private
 */
exports.getGeofence = async (req, res) => {
  try {
    const geofence = await Geofence.findById(req.params.id);

    if (!geofence) {
      return res.status(404).json({
        success: false,
        message: "Geofence not found",
      });
    }

    if (geofence.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this geofence",
      });
    }

    res.status(200).json({
      success: true,
      geofence,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to fetch geofence: ${error.message}`,
    });
  }
};

/**
 * @route   PUT /api/geofences/:id
 * @desc    Update geofence
 * @access  Private
 */
exports.updateGeofence = async (req, res) => {
  try {
    const { name, description, coordinates, isActive, provinceName } = req.body;

    let geofence = await Geofence.findById(req.params.id);

    if (!geofence) {
      return res.status(404).json({
        success: false,
        message: "Geofence not found",
      });
    }

    if (geofence.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this geofence",
      });
    }

    if (name) geofence.name = name;
    if (description !== undefined) geofence.description = description;
    if (isActive !== undefined) geofence.isActive = isActive;

    if (coordinates && geofence.type === "polygon") {
      geofence.geometry = {
        type: "Polygon",
        coordinates: [coordinates],
      };
    }

    if (provinceName && geofence.type === "province") {
      const geometry = getProvinceGeometry(provinceName);
      if (!geometry) {
        return res.status(400).json({
          success: false,
          message: "Invalid province name",
        });
      }
      geofence.provinceName = provinceName;
      geofence.geometry = geometry;
    }

    geofence = await geofence.save();

    res.status(200).json({
      success: true,
      message: "Geofence updated successfully",
      geofence,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to update geofence: ${error.message}`,
    });
  }
};

/**
 * @route   DELETE /api/geofences/:id
 * @desc    Delete geofence
 * @access  Private
 */
exports.deleteGeofence = async (req, res) => {
  try {
    const geofence = await Geofence.findById(req.params.id);

    if (!geofence) {
      return res.status(404).json({
        success: false,
        message: "Geofence not found",
      });
    }

    if (geofence.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this geofence",
      });
    }

    await Geofence.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Geofence deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to delete geofence: ${error.message}`,
    });
  }
};

/**
 * @route   GET /api/provinces
 * @desc    Get list of all provinces
 * @access  Private
 */
exports.getProvinces = async (req, res) => {
  try {
    const provinces = loadProvinceList();

    const provinceList = provinces.map((name) => ({
      name,
    }));

    res.status(200).json({
      success: true,
      count: provinceList.length,
      provinces: provinceList,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to fetch provinces: ${error.message}`,
    });
  }
};

/**
 * @route   GET /api/geofences/provinces/:provinceName/geometry
 * @desc    Get geometry for a specific province (for preview before saving)
 * @access  Private
 */
exports.getProvinceGeometryEndpoint = async (req, res) => {
  try {
    const { provinceName } = req.params;

    if (!provinceName) {
      return res.status(400).json({
        success: false,
        message: "Province name is required",
      });
    }

    const geometry = getProvinceGeometry(provinceName);

    if (!geometry) {
      return res.status(404).json({
        success: false,
        message: "Invalid province name",
      });
    }

    res.status(200).json({
      success: true,
      geometry,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to fetch province geometry: ${error.message}`,
    });
  }
};

/**
 * @route   GET /api/vehicles/:vehicleId/compliance-status
 * @desc    Get compliance status of a vehicle
 * @access  Private
 */
exports.getVehicleComplianceStatus = async (req, res) => {
  try {
    const Vehicle = require("../models/Vehicle");
    const { vehicleId } = req.params;

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

    const complianceManager = require("../utils/complianceManager");
    const complianceStatus = complianceManager.getComplianceStatus(vehicle);

    res.status(200).json({
      success: true,
      status: vehicle.status,
      ...complianceStatus,
      lastViolationAt: vehicle.lastViolationAt,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to fetch compliance status: ${error.message}`,
    });
  }
};
