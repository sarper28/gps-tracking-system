const mongoose = require("mongoose");

const notificationLogSchema = new mongoose.Schema(
  {
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true,
    },
    geofenceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Geofence",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "sent", "failed"],
      default: "pending",
    },
    channel: {
      type: String,
      enum: ["email", "telegram", "whatsapp", "webhook"],
      required: true,
    },
    message: {
      type: String,
      default: "",
    },
    errorMessage: {
      type: String,
      default: null,
    },
    n8nResponse: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    sentAt: {
      type: Date,
      default: null,
    },
    violationDetails: {
      vehicleName: String,
      geofenceName: String,
      location: {
        type: {
          type: String,
          enum: ["Point"],
        },
        coordinates: [Number],
      },
      violationType: {
        type: String,
        enum: ["entry", "exit"],
      },
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true },
);

// Create compound index for efficient queries
notificationLogSchema.index({ vehicleId: 1, createdAt: -1 });
notificationLogSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("NotificationLog", notificationLogSchema);
