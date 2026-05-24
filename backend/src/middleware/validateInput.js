const { body, param, query, validationResult } = require("express-validator");

// Validation result handler middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors: errors.array().map((err) => ({
        field: err.param,
        message: err.msg,
      })),
    });
  }
  next();
};

// Registration validation
const validateRegister = [
  body("name").trim().notEmpty().withMessage("Name is required").isLength({ min: 2 }).withMessage("Name must be at least 2 characters"),
  body("email").trim().notEmpty().withMessage("Email is required").isEmail().withMessage("Invalid email address"),
  body("password").notEmpty().withMessage("Password is required").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  handleValidationErrors,
];

// Login validation
const validateLogin = [body("email").trim().notEmpty().withMessage("Email is required").isEmail().withMessage("Invalid email address"), body("password").notEmpty().withMessage("Password is required"), handleValidationErrors];

// Vehicle validation
const validateVehicle = [
  body("vehicleName").trim().notEmpty().withMessage("Vehicle name is required").isLength({ min: 2 }).withMessage("Vehicle name must be at least 2 characters"),
  body("deviceId").trim().notEmpty().withMessage("Device ID is required").isLength({ min: 5 }).withMessage("Device ID must be at least 5 characters"),
  handleValidationErrors,
];

// Geofence validation
const validateGeofence = [
  body("name").trim().notEmpty().withMessage("Geofence name is required").isLength({ min: 2 }).withMessage("Geofence name must be at least 2 characters"),
  body("coordinates").isArray({ min: 3 }).withMessage("Coordinates must be an array with at least 3 points"),
  body("description").optional().trim(),
  handleValidationErrors,
];

// Location validation
const validateLocation = [
  body("deviceId").trim().notEmpty().withMessage("Device ID is required"),
  body("latitude").isFloat({ min: -90, max: 90 }).withMessage("Latitude must be between -90 and 90"),
  body("longitude").isFloat({ min: -180, max: 180 }).withMessage("Longitude must be between -180 and 180"),
  body("accuracy").optional().isFloat({ min: 0 }),
  body("speed").optional().isFloat({ min: 0 }),
  body("heading").optional().isFloat({ min: 0, max: 360 }),
  handleValidationErrors,
];

// Pagination validation
const validatePagination = [
  query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100"),
  handleValidationErrors,
];

// Notification config validation
const validateNotificationConfig = [
  body("email.enabled").optional().isBoolean(),
  body("email.address")
    .if(() => body("email.enabled").notEmpty())
    .optional()
    .trim()
    .isEmail()
    .withMessage("Invalid email address"),
  body("telegram.enabled").optional().isBoolean(),
  body("telegram.botToken")
    .if(() => body("telegram.enabled").notEmpty())
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Bot token required if Telegram is enabled"),
  body("telegram.chatId")
    .if(() => body("telegram.enabled").notEmpty())
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Chat ID required if Telegram is enabled"),
  body("whatsapp.enabled").optional().isBoolean(),
  body("whatsapp.webhookUrl")
    .if(() => body("whatsapp.enabled").notEmpty())
    .optional()
    .trim()
    .isURL()
    .withMessage("Invalid webhook URL"),
  handleValidationErrors,
];

// Vehicle ID param validation
const validateVehicleId = [param("vehicleId").isMongoId().withMessage("Invalid vehicle ID"), handleValidationErrors];

module.exports = {
  validateRegister,
  validateLogin,
  validateVehicle,
  validateGeofence,
  validateLocation,
  validatePagination,
  validateNotificationConfig,
  validateVehicleId,
  handleValidationErrors,
};
