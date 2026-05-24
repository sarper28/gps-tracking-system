const mongoose = require("mongoose");

const locationLogSchema = new mongoose.Schema(
  {
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    isViolation: {
      type: Boolean,
      default: false,
    },
    violatedGeofences: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Geofence",
      },
    ],
    vehicleStatus: {
      type: String,
      enum: ["normal", "warning", "penalty"],
      default: "normal",
    },
    violationReason: String,
    isOutOfProvince: {
      type: Boolean,
      default: false,
    },
    accuracy: {
      type: Number,
      default: null,
    },
    speed: {
      type: Number,
      default: null,
    },
    heading: {
      type: Number,
      default: null,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

// Create geospatial index
locationLogSchema.index({ location: "2dsphere" });

// Create compound index for efficient queries
locationLogSchema.index({ vehicleId: 1, timestamp: -1 });

module.exports = mongoose.model("LocationLog", locationLogSchema);
