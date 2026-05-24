require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const helmet = require("helmet");

// Import security middleware
const { authLimiter, locationLimiter } = require("./middleware/rateLimiter");
const errorHandler = require("./middleware/errorHandler");

// Initialize Express app
const app = express();

// Security Middleware
app.use(helmet()); // Add security headers

// CORS Middleware
app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));

// Body Parser Middleware
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));

// Routes
const authRoutes = require("./routes/authRoutes");
const vehicleRoutes = require("./routes/vehicleRoutes");
const geofenceRoutes = require("./routes/geofenceRoutes");
const locationRoutes = require("./routes/locationRoutes");
const historyRoutes = require("./routes/historyRoutes");

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "Server is running" });
});

// API Routes with Rate Limiting
app.use("/api/auth", authLimiter, authRoutes); // Rate limit auth routes
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/geofences", geofenceRoutes);
app.use("/api/location", locationLimiter, locationRoutes); // Rate limit location updates
app.use("/api/history", historyRoutes); // New history routes (auto-authenticated)

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Centralized error handling middleware (MUST be last)
app.use(errorHandler);

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/gps_tracker";

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log(" MongoDB connected successfully");
  })
  .catch((error) => {
    console.error(" MongoDB connection failed:", error.message);
    process.exit(1);
  });

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`

  GPS Vehicle Tracking System                       
  Server running at http://localhost:${PORT}            
  Environment: ${process.env.NODE_ENV || "development"}
  Database: ${MONGODB_URI}

  `);
});

module.exports = app;
