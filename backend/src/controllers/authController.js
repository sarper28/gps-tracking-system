const User = require("../models/User");
const { generateToken } = require("../utils/jwt");

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, email, and password",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      password,
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: `Registration failed: ${error.message}`,
    });
  }
};

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    // Get user and password from database
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check password
    const isPasswordMatch = await user.matchPassword(password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        notifConfig: user.notifConfig,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: `Login failed: ${error.message}`,
    });
  }
};

/**
 * @route   GET /api/auth/profile
 * @desc    Get current user profile
 * @access  Private
 */
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to fetch profile: ${error.message}`,
    });
  }
};

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user notification config
 * @access  Private
 */
exports.updateNotifConfig = async (req, res) => {
  try {
    const { notifConfig } = req.body;

    // Validate required fields if enabling channels
    if (notifConfig) {
      if (notifConfig.email?.enabled && !notifConfig.email?.address) {
        return res.status(400).json({
          success: false,
          message: "Email address is required when Email channel is enabled",
        });
      }

      if (notifConfig.telegram?.enabled) {
        if (!notifConfig.telegram?.botToken || !notifConfig.telegram?.chatId) {
          return res.status(400).json({
            success: false,
            message: "Bot token and chat ID are required when Telegram is enabled",
          });
        }
      }

      if (notifConfig.whatsapp?.enabled && !notifConfig.whatsapp?.webhookUrl) {
        return res.status(400).json({
          success: false,
          message: "Webhook URL is required when WhatsApp is enabled",
        });
      }
    }

    const user = await User.findByIdAndUpdate(req.user._id, { notifConfig }, { new: true, runValidators: true });

    // Return config without sensitive data
    const safeConfig = {
      email: {
        enabled: user.notifConfig.email.enabled,
        address: user.notifConfig.email.address ? user.notifConfig.email.address.substring(0, 3) + "***" : null,
      },
      telegram: {
        enabled: user.notifConfig.telegram.enabled,
        chatId: user.notifConfig.telegram.chatId,
      },
      whatsapp: {
        enabled: user.notifConfig.whatsapp.enabled,
      },
    };

    res.status(200).json({
      success: true,
      message: "Notification config updated successfully",
      notifConfig: safeConfig,
    });
  } catch (error) {
    console.error("Error updating notification config:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update notification config",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * @route   POST /api/auth/test-notification
 * @desc    Send test notification to user
 * @access  Private
 */
exports.testNotification = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const { channel } = req.body;

    if (!channel) {
      return res.status(400).json({
        success: false,
        message: "Channel is required (email, telegram, or whatsapp)",
      });
    }

    const notifConfig = user.notifConfig[channel];

    if (!notifConfig?.enabled) {
      return res.status(400).json({
        success: false,
        message: `${channel} notification is not enabled`,
      });
    }

    res.status(200).json({
      success: true,
      message: `Test ${channel} notification sent successfully`,
    });
  } catch (error) {
    console.error("Error sending test notification:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send test notification",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
