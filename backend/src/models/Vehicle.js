const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    vehicleName: {
      type: String,
      required: [true, "Please provide a vehicle name"],
      trim: true,
    },
    deviceId: {
      type: String,
      required: [true, "Please provide a device ID"],
      unique: true,
    },
    licensePlate: {
      type: String,
      required: [true, "Please provide a license plate number"],
      trim: true,
      unique: true,
    },
    currentLocation: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
        default: [0, 0],
      },
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ["normal", "warning", "penalty"],
      default: "normal",
    },
    warningStartTime: {
      type: Date,
      default: null,
    },
    lastViolationAt: {
      type: Date,
      default: null,
    },
    isOutOfProvince: {
      type: Boolean,
      default: false,
    },
    lastNotificationAt: {
      type: Date,
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

// Create geospatial index for location
vehicleSchema.index({ currentLocation: "2dsphere" });

// Ensure compound index on userId and deviceId
vehicleSchema.index({ userId: 1, deviceId: 1 });

// Index on status for quick compliance queries
vehicleSchema.index({ status: 1, warningStartTime: 1 });

module.exports = mongoose.model("Vehicle", vehicleSchema);
