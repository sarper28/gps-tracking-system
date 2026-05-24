/**
 * Ray Casting Algorithm for Point-in-Polygon Detection
 * Used to determine if a point (GPS location) is inside a polygon (geofence)
 *
 * @param {number[]} point - [longitude, latitude]
 * @param {number[][][]} polygon - GeoJSON polygon coordinates [[[lon, lat], ...]]
 * @returns {boolean} True if point is inside polygon
 */
const isPointInPolygon = (point, polygon) => {
  const [lon, lat] = point;
  const exterior = polygon[0]; // Exterior ring

  let isInside = false;

  // Ray casting algorithm
  for (let i = 0, j = exterior.length - 1; i < exterior.length; j = i++) {
    const xi = exterior[i][0],
      yi = exterior[i][1];
    const xj = exterior[j][0],
      yj = exterior[j][1];

    const intersect = yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;

    if (intersect) isInside = !isInside;
  }

  return isInside;
};

/**
 * Check if a point is inside any of the geofences
 *
 * @param {number[]} point - [longitude, latitude]
 * @param {Array} geofences - Array of geofence objects with geometry
 * @returns {Array} Array of geofence IDs where point is inside
 */
const findViolatedGeofences = (point, geofences) => {
  const violatedGeofences = [];

  for (const geofence of geofences) {
    if (isPointInPolygon(point, geofence.geometry.coordinates)) {
      violatedGeofences.push(geofence._id);
    }
  }

  return violatedGeofences;
};

/**
 * Calculate distance between two points using Haversine formula
 *
 * @param {number[]} point1 - [longitude, latitude]
 * @param {number[]} point2 - [longitude, latitude]
 * @returns {number} Distance in kilometers
 */
const calculateDistance = (point1, point2) => {
  const [lon1, lat1] = point1;
  const [lon2, lat2] = point2;

  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Trigger N8N Webhook for geofence violation
 *
 * @param {object} violationData - Data to send to webhook
 * @returns {Promise<object>} Response from webhook
 */
const triggerN8NWebhook = async (violationData) => {
  try {
    const axios = require("axios");

    const payload = {
      event: "geofence_violation",
      timestamp: new Date().toISOString(),
      ...violationData,
    };

    const response = await axios.post(process.env.N8N_WEBHOOK_URL, payload, {
      timeout: 5000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("[N8N Webhook] Successfully triggered:", response.status);
    return response.data;
  } catch (error) {
    console.error("[N8N Webhook Error]:", error.message);
    throw error;
  }
};

module.exports = {
  isPointInPolygon,
  findViolatedGeofences,
  calculateDistance,
  triggerN8NWebhook,
};
