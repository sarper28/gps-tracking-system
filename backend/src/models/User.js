const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a name"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Please provide an email"],
      unique: true,
      lowercase: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: 6,
      select: false, // Do not return password by default
    },
    notifConfig: {
      email: {
        enabled: {
          type: Boolean,
          default: true,
        },
        address: {
          type: String,
          default: null,
          validate: {
            validator: function (v) {
              if (!v) return true;
              return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v);
            },
            message: "Invalid email address",
          },
        },
      },
      telegram: {
        enabled: {
          type: Boolean,
          default: false,
        },
        botToken: {
          type: String,
          default: null,
        },
        chatId: {
          type: String,
          default: null,
        },
      },
      whatsapp: {
        enabled: {
          type: Boolean,
          default: false,
        },
        webhookUrl: {
          type: String,
          default: null,
          validate: {
            validator: function (v) {
              if (!v) return true;
              return /^https?:\/\/.+/.test(v);
            },
            message: "Invalid webhook URL",
          },
        },
      },
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
