#!/usr/bin/env node

/**
 * GPS Simulator - Enhanced Multi-Vehicle GPS Location Simulator
 * Supports multiple vehicles, various movement patterns, and geofence testing
 */

const axios = require("axios");

const API_URL = process.env.API_URL || "http://localhost:5000/api";
const UPDATE_INTERVAL = parseInt(process.env.UPDATE_INTERVAL) || 3000; // 3 seconds

// Movement types
const MOVEMENT_TYPES = {
  RANDOM_WALK: "random_walk",
  ROUTE_FOLLOWING: "route_following",
  GEOFENCE_TEST: "geofence_test", // Intentionally enter/exit geofences
};

// Define simulated vehicles
const VEHICLES = [
  {
    deviceId: "SIM_001",
    vehicleName: "Police Unit - NYC",
    startLocation: { lat: 40.7128, lng: -74.006 },
    movementType: MOVEMENT_TYPES.RANDOM_WALK,
    speed: 50, // km/h (converted to lat/lng delta)
  },
  {
    deviceId: "SIM_002",
    vehicleName: "Delivery Van - LA",
    startLocation: { lat: 34.0522, lng: -118.2437 },
    movementType: MOVEMENT_TYPES.RANDOM_WALK,
    speed: 60,
  },
  {
    deviceId: "SIM_003",
    vehicleName: "Taxi - Chicago",
    startLocation: { lat: 41.8781, lng: -87.6298 },
    movementType: MOVEMENT_TYPES.ROUTE_FOLLOWING,
    speed: 40,
    path: [
      { lat: 41.8781, lng: -87.6298 },
      { lat: 41.8844, lng: -87.6205 },
      { lat: 41.8907, lng: -87.6112 },
      { lat: 41.897, lng: -87.6019 },
      { lat: 41.9033, lng: -87.5926 },
    ],
  },
];

let vehicleStates = {};

// Initialize vehicle states
VEHICLES.forEach((vehicle) => {
  vehicleStates[vehicle.deviceId] = {
    currentLocation: { ...vehicle.startLocation },
    lastDirection: { lat: 0, lng: 0 },
    routeIndex: 0,
    routeProgress: 0,
    locationsCount: 0,
  };
});

/**
 * Convert speed (km/h) to lat/lng delta per update
 */
function speedToLatLngDelta(speedKmh, intervalMs) {
  // Approximate: 1 degree lat ≈ 111 km
  // interval is in milliseconds
  const deltaPerSecond = speedKmh / 111 / 3600; // km/h to degree/s
  return deltaPerSecond * (intervalMs / 1000);
}

/**
 * Generate random walk movement
 */
function getRandomWalkMovement(currentLoc, speedKmh, updateIntervalMs) {
  const delta = speedToLatLngDelta(speedKmh, updateIntervalMs);

  // Random direction
  const angle = Math.random() * Math.PI * 2;
  const distance = delta * (0.5 + Math.random() * 0.5); // Some randomness in distance

  return {
    lat: currentLoc.lat + Math.sin(angle) * distance,
    lng: currentLoc.lng + Math.cos(angle) * distance,
  };
}

/**
 * Generate route-following movement
 */
function getRouteFollowingMovement(currentLoc, state, vehicle, updateIntervalMs) {
  const path = vehicle.path;
  if (!path || path.length < 2) {
    return getRandomWalkMovement(currentLoc, vehicle.speed, updateIntervalMs);
  }

  const delta = speedToLatLngDelta(vehicle.speed, updateIntervalMs);

  if (state.routeIndex >= path.length - 1) {
    state.routeIndex = 0;
    state.routeProgress = 0;
  }

  const start = path[state.routeIndex];
  const end = path[state.routeIndex + 1];

  const distance = Math.sqrt(Math.pow(end.lat - start.lat, 2) + Math.pow(end.lng - start.lng, 2));

  state.routeProgress += delta / distance;

  if (state.routeProgress >= 1) {
    state.routeIndex++;
    state.routeProgress = 0;
    if (state.routeIndex >= path.length) {
      state.routeIndex = 0;
    }
  }

  const currentStart = path[Math.min(state.routeIndex, path.length - 1)];
  const currentEnd = path[Math.min(state.routeIndex + 1, path.length - 1)];
  const progress = state.routeProgress;

  return {
    lat: currentStart.lat + (currentEnd.lat - currentStart.lat) * progress,
    lng: currentStart.lng + (currentEnd.lng - currentStart.lng) * progress,
  };
}

/**
 * Send location update to backend
 */
async function sendLocationUpdate(deviceId, vehicleName, latitude, longitude) {
  try {
    const response = await axios.post(`${API_URL}/location`, {
      deviceId,
      latitude,
      longitude,
      accuracy: Math.random() * 10 + 5,
      speed: Math.random() * 40 + 10,
      heading: Math.random() * 360,
    });

    const timestamp = new Date().toLocaleTimeString();
    const violation = response.data.data?.isViolation;
    const status = violation ? "⚠️ VIOLATION" : "✓";

    console.log(`[${timestamp}] ${status} ${vehicleName}: (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);

    if (violation) {
      const geofences = response.data.data.violatedGeofences || [];
      console.log(`         → Violated ${geofences.length} geofence(s)`);
    }

    return response.data;
  } catch (error) {
    console.error(`[Error] ${vehicleName}: ${error.response?.data?.message || error.message}`);
  }
}

/**
 * Simulate movement for all vehicles
 */
async function simulateMovement() {
  for (const vehicle of VEHICLES) {
    const state = vehicleStates[vehicle.deviceId];
    let newLocation;

    // Generate new location based on movement type
    switch (vehicle.movementType) {
      case MOVEMENT_TYPES.RANDOM_WALK:
        newLocation = getRandomWalkMovement(state.currentLocation, vehicle.speed, UPDATE_INTERVAL);
        break;

      case MOVEMENT_TYPES.ROUTE_FOLLOWING:
        newLocation = getRouteFollowingMovement(state.currentLocation, state, vehicle, UPDATE_INTERVAL);
        break;

      default:
        newLocation = getRandomWalkMovement(state.currentLocation, vehicle.speed, UPDATE_INTERVAL);
    }

    // Clamp to valid lat/lng ranges
    newLocation.lat = Math.max(-90, Math.min(90, newLocation.lat));
    newLocation.lng = Math.max(-180, Math.min(180, newLocation.lng));

    state.currentLocation = newLocation;
    state.locationsCount++;

    await sendLocationUpdate(vehicle.deviceId, vehicle.vehicleName, newLocation.lat, newLocation.lng);
  }
}

/**
 * Start the simulator
 */
function startSimulator() {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║  🚗 GPS Vehicle Simulator - ENHANCED                     ║
║  Sending location updates to: ${API_URL}
║  Update interval: ${UPDATE_INTERVAL}ms
║  Simulating ${VEHICLES.length} vehicles
║  Press Ctrl+C to stop
╚═══════════════════════════════════════════════════════════╝
  `);

  console.log("\n📍 Simulated Vehicles:\n");
  VEHICLES.forEach((v) => {
    console.log(`  • ${v.vehicleName} (${v.deviceId})`);
    console.log(`    Movement: ${v.movementType} | Speed: ${v.speed} km/h`);
    console.log(`    Start: (${v.startLocation.lat.toFixed(4)}, ${v.startLocation.lng.toFixed(4)})`);
  });

  console.log("\n▶ Starting simulation...\n");

  // Send initial locations
  simulateMovement();

  // Send updates at regular intervals
  setInterval(simulateMovement, UPDATE_INTERVAL);

  // Stats every 30 seconds
  setInterval(() => {
    const totalLocations = Object.values(vehicleStates).reduce((sum, state) => sum + state.locationsCount, 0);
    console.log(`\n📊 Stats: ${totalLocations} total locations sent\n`);
  }, 30000);
}

// Handle graceful shutdown
process.on("SIGINT", () => {
  console.log("\n\n🛑 Simulator stopped.");
  process.exit(0);
});

startSimulator();
