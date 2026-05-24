const express = require("express");
const { register, login, getProfile, updateNotifConfig, testNotification } = require("../controllers/authController");
const authenticate = require("../middleware/authenticate");

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);

// Private routes
router.get("/profile", authenticate, getProfile);
router.put("/profile", authenticate, updateNotifConfig);
router.post("/test-notification", authenticate, testNotification);

module.exports = router;
