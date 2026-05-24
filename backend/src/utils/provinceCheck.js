const turf = require("@turf/turf");
const fs = require("fs");
const path = require("path");

let cachedGeoJSON = null;

const loadGeoJSON = () => {
  if (cachedGeoJSON) return cachedGeoJSON;

  try {
    const geoJsonPath = path.join(__dirname, "../data/indonesia-38-provinces.geojson");
    const data = fs.readFileSync(geoJsonPath, "utf8");
    cachedGeoJSON = JSON.parse(data);
    console.log("[Province Check] GeoJSON loaded and cached");
    return cachedGeoJSON;
  } catch (error) {
    console.error("[Province Check] Error loading GeoJSON:", error.message);
    throw new Error("Failed to load province GeoJSON data");
  }
};

const findProvinceFeature = (provinceName) => {
  const geoData = loadGeoJSON();

  return geoData.features.find((feature) => feature.properties.PROVINSI && feature.properties.PROVINSI.toLowerCase() === provinceName.toLowerCase());
};

const checkProvinceViolation = (latitude, longitude, provinceName) => {
  try {
    const feature = findProvinceFeature(provinceName);

    if (!feature) {
      console.error(`[Province Check] Province not found: ${provinceName}`);
      return { isInside: false, error: "Province not found" };
    }

    const point = turf.point([longitude, latitude]);
    const geometry = feature.geometry;

    let isInside = false;

    if (geometry.type === "Polygon") {
      isInside = turf.booleanPointInPolygon(point, {
        type: "Feature",
        geometry: geometry,
      });
    } else if (geometry.type === "MultiPolygon") {
      for (const polygon of geometry.coordinates) {
        const polyFeature = {
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: polygon,
          },
        };

        if (turf.booleanPointInPolygon(point, polyFeature)) {
          isInside = true;
          break;
        }
      }
    }

    return {
      isInside,
      provinceName,
      geometry,
    };
  } catch (error) {
    console.error("[Province Check] Error checking province violation:", error.message);
    return { isInside: false, error: error.message };
  }
};

const loadProvinceList = () => {
  try {
    const geoData = loadGeoJSON();
    const provinces = geoData.features
      .map((feature) => feature.properties.PROVINSI)
      .filter((name) => name)
      .sort();

    return [...new Set(provinces)];
  } catch (error) {
    console.error("[Province Check] Error loading province list:", error.message);
    throw error;
  }
};

const getProvinceGeometry = (provinceName) => {
  try {
    const feature = findProvinceFeature(provinceName);

    if (!feature) {
      return null;
    }

    return feature.geometry;
  } catch (error) {
    console.error("[Province Check] Error getting province geometry:", error.message);
    return null;
  }
};

module.exports = {
  checkProvinceViolation,
  loadProvinceList,
  getProvinceGeometry,
  loadGeoJSON,
  findProvinceFeature,
};
