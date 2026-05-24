const nodemailer = require("nodemailer");
const axios = require("axios");

// Email transporter - configure with your SMTP settings
const emailTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: process.env.SMTP_PORT || 587,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

/**
 * Send email notification
 */
async function sendEmailNotification(toEmail, subject, message) {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      console.warn("Email SMTP not configured");
      return false;
    }

    await emailTransporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: toEmail,
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5;">
          <div style="background: white; padding: 20px; border-radius: 8px; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2c3e50; margin-top: 0;">⚠️ GPS Tracker Alert</h2>
            <p style="color: #555; line-height: 1.6;">${message}</p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
            <p style="color: #999; font-size: 12px;">This is an automated notification from GPS Tracker System.</p>
          </div>
        </div>
      `,
    });

    console.log(`Email sent to ${toEmail}`);
    return true;
  } catch (error) {
    console.error("Error sending email:", error.message);
    return false;
  }
}

/**
 * Send Telegram notification
 */
async function sendTelegramNotification(botToken, chatId, message) {
  try {
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    await axios.post(url, {
      chat_id: chatId,
      text: message,
      parse_mode: "HTML",
    });

    console.log(`Telegram message sent to chat ${chatId}`);
    return true;
  } catch (error) {
    console.error("Error sending Telegram notification:", error.message);
    return false;
  }
}

/**
 * Send WhatsApp notification via N8N webhook
 */
async function sendWhatsAppNotification(webhookUrl, message) {
  try {
    await axios.post(webhookUrl, {
      message: message,
      timestamp: new Date().toISOString(),
    });

    console.log("WhatsApp notification sent via webhook");
    return true;
  } catch (error) {
    console.error("Error sending WhatsApp notification:", error.message);
    return false;
  }
}

/**
 * Send notification to user based on enabled channels
 */
async function sendNotification(user, subject, message) {
  const results = {
    email: false,
    telegram: false,
    whatsapp: false,
  };

  try {
    // Send via Email
    if (user.notifConfig?.email?.enabled && user.notifConfig?.email?.address) {
      results.email = await sendEmailNotification(user.notifConfig.email.address, subject, message);
    }

    // Send via Telegram
    if (user.notifConfig?.telegram?.enabled && user.notifConfig?.telegram?.botToken && user.notifConfig?.telegram?.chatId) {
      const telegramMsg = `<b>${subject}</b>\n${message}`;
      results.telegram = await sendTelegramNotification(
        user.notifConfig.telegram.botToken,
        user.notifConfig.telegram.chatId,
        telegramMsg
      );
    }

    // Send via WhatsApp
    if (user.notifConfig?.whatsapp?.enabled && user.notifConfig?.whatsapp?.webhookUrl) {
      results.whatsapp = await sendWhatsAppNotification(user.notifConfig.whatsapp.webhookUrl, `${subject}\n${message}`);
    }

    return results;
  } catch (error) {
    console.error("Error sending notifications:", error);
    return results;
  }
}

/**
 * Send test notification
 */
async function sendTestNotification(user, channel) {
  const testMessage = "✅ Test notification from GPS Tracker System";
  const results = {
    [channel]: false,
  };

  try {
    if (channel === "email") {
      if (!user.notifConfig?.email?.address) {
        throw new Error("Email address not configured");
      }
      results.email = await sendEmailNotification(
        user.notifConfig.email.address,
        "GPS Tracker - Test Notification",
        testMessage
      );
    } else if (channel === "telegram") {
      if (!user.notifConfig?.telegram?.botToken || !user.notifConfig?.telegram?.chatId) {
        throw new Error("Telegram not configured");
      }
      results.telegram = await sendTelegramNotification(
        user.notifConfig.telegram.botToken,
        user.notifConfig.telegram.chatId,
        testMessage
      );
    } else if (channel === "whatsapp") {
      if (!user.notifConfig?.whatsapp?.webhookUrl) {
        throw new Error("WhatsApp webhook not configured");
      }
      results.whatsapp = await sendWhatsAppNotification(user.notifConfig.whatsapp.webhookUrl, testMessage);
    }

    return results;
  } catch (error) {
    console.error(`Error sending test ${channel} notification:`, error);
    throw error;
  }
}

module.exports = {
  sendNotification,
  sendTestNotification,
  sendEmailNotification,
  sendTelegramNotification,
  sendWhatsAppNotification,
};
