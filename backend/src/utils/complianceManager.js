const WARNING_WINDOW_MS = 30 * 60 * 1000;
const NOTIFICATION_COOLDOWN_MS = 5 * 60 * 1000;

const processViolation = (vehicle) => {
  const now = new Date();

  if (vehicle.status === "warning") {
    const warningDuration = now - new Date(vehicle.warningStartTime);

    if (warningDuration > WARNING_WINDOW_MS) {
      return {
        newStatus: "penalty",
        action: "penalty_triggered",
        message: "Vehicle failed to return within 30 minutes. Penalty status activated.",
      };
    }

    const minutesRemaining = Math.floor((WARNING_WINDOW_MS - warningDuration) / 60000);

    return {
      newStatus: "warning",
      action: "warning_ongoing",
      minutesRemaining,
      message: `Vehicle outside operational area. Please return within ${minutesRemaining} minutes.`,
    };
  }

  if (vehicle.status === "normal" || vehicle.status === "penalty") {
    return {
      newStatus: "warning",
      action: "warning_triggered",
      warningStartTime: now,
      message: "Vehicle exited operational area. Please return within 30 minutes.",
    };
  }

  return {
    newStatus: vehicle.status,
    action: "no_change",
  };
};

const resetComplianceStatus = (vehicle) => {
  return {
    newStatus: "normal",
    action: "returned_to_province",
    message: "Vehicle returned to operational area. Status reset to normal.",
    warningStartTime: null,
  };
};

const getComplianceStatus = (vehicle) => {
  const now = new Date();

  if (vehicle.status === "warning" && vehicle.warningStartTime) {
    const warningDuration = now - new Date(vehicle.warningStartTime);
    const minutesRemaining = Math.max(0, Math.floor((WARNING_WINDOW_MS - warningDuration) / 60000));

    return {
      status: "warning",
      warningStartTime: vehicle.warningStartTime,
      minutesRemaining,
      willPenalizeAt: new Date(new Date(vehicle.warningStartTime).getTime() + WARNING_WINDOW_MS),
    };
  }

  return {
    status: vehicle.status,
    warningStartTime: vehicle.warningStartTime || null,
    minutesRemaining: null,
  };
};

const shouldSendNotification = (vehicle) => {
  if (!vehicle.lastNotificationAt) {
    return true;
  }

  const timeSinceLastNotif = new Date() - new Date(vehicle.lastNotificationAt);
  return timeSinceLastNotif > NOTIFICATION_COOLDOWN_MS;
};

module.exports = {
  processViolation,
  resetComplianceStatus,
  getComplianceStatus,
  shouldSendNotification,
  WARNING_WINDOW_MS,
  NOTIFICATION_COOLDOWN_MS,
};
