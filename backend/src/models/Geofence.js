const mongoose = require("mongoose");

const geofenceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: [true, "Please provide a vehicle ID"],
    },
    name: {
      type: String,
      required: [true, "Please provide a geofence name"],
      trim: true,
    },
    type: {
      type: String,
      enum: ["polygon", "province"],
      default: "polygon",
    },
    geometry: {
      type: {
        type: String,
        enum: ["Polygon", "MultiPolygon"],
        required: true,
      },
      coordinates: {
        type: mongoose.Schema.Types.Mixed, // Support both Polygon and MultiPolygon formats
        required: true,
      },
    },
    provinceName: {
      type: String,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    description: {
      type: String,
      default: "",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

// Create geospatial index for geometry
geofenceSchema.index({ geometry: "2dsphere" });

// Ensure compound index on userId and vehicleId
geofenceSchema.index({ userId: 1, vehicleId: 1 });

// Index on type for faster filtering
geofenceSchema.index({ type: 1, userId: 1, vehicleId: 1 });

module.exports = mongoose.model("Geofence", geofenceSchema);
