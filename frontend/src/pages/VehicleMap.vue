<template>
  <div class="vehicle-map-container">
    <div class="map-controls">
      <h1>Pemantauan Kendaraan Real-Time</h1>
      <div class="controls">
        <select v-model="selectedVehicleId" class="vehicle-select">
          <option value="">Pilih Kendaraan</option>
          <option v-for="vehicle in vehicles" :key="vehicle._id" :value="vehicle._id">
            {{ vehicle.vehicleName }}
          </option>
        </select>
        <button @click="toggleTracking" :class="{ tracking: isTracking }" class="btn">
          {{ isTracking ? "⏸ Hentikan Pelacakan" : "▶ Mulai Pelacakan" }}
        </button>
      </div>
    </div>

    <div id="map" class="map"></div>

    <VehicleInfoPanel :vehicleInfo="selectedVehicleInfo" />
  </div>
</template>

<script>
import api from "../services/api";
import L from "leaflet";
import VehicleInfoPanel from "../components/map/VehicleInfoPanel.vue";

export default {
  name: "VehicleMap",
  components: {
    VehicleInfoPanel,
  },
  data() {
    return {
      map: null,
      vehicles: [],
      selectedVehicleId: "",
      selectedVehicleInfo: null,
      isTracking: false,
      markers: {},
      geofencePolygons: {},
      trackingInterval: null,
      allGeofences: [],
    };
  },
  mounted() {
    this.initMap();
    this.fetchVehicles();
    this.fetchGeofences();
  },
  beforeUnmount() {
    if (this.trackingInterval) {
      clearInterval(this.trackingInterval);
    }
  },
  watch: {
    selectedVehicleId(newVal) {
      if (newVal) {
        const vehicle = this.vehicles.find((v) => v._id === newVal);
        this.selectedVehicleInfo = vehicle;
        this.centerMapOnVehicle(vehicle);
        this.updateGeofencesForVehicle(newVal);
        this.updateVehicleMarker(vehicle);
      } else {
        this.clearAllGeofences();
        this.clearAllMarkers();
      }
    },
  },
  methods: {
    initMap() {
      this.map = L.map("map").setView([51.505, -0.09], 13);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(this.map);
    },
    async fetchVehicles() {
      try {
        const response = await api.getVehicles();
        if (response.data.success) {
          this.vehicles = response.data.vehicles;
          this.addVehicleMarkers();
        }
      } catch (error) {
        console.error("Failed to fetch vehicles:", error);
      }
    },
    async fetchGeofences() {
      try {
        const response = await api.getGeofences();
        if (response.data.success) {
          this.allGeofences = response.data.geofences;
        }
      } catch (error) {
        console.error("Failed to fetch geofences:", error);
      }
    },
    updateGeofencesForVehicle(vehicleId) {
      this.clearAllGeofences();
      const vehicleGeofences = this.allGeofences.filter((g) => g.vehicleId === vehicleId);
      this.drawGeofences(vehicleGeofences);
    },
    clearAllGeofences() {
      Object.values(this.geofencePolygons).forEach((polygon) => {
        this.map.removeLayer(polygon);
      });
      this.geofencePolygons = {};
    },
    addVehicleMarkers() {
      this.vehicles.forEach((vehicle) => {
        const [lng, lat] = vehicle.currentLocation.coordinates;
        const marker = L.marker([lat, lng], {
          title: vehicle.vehicleName,
          icon: L.icon({
            iconUrl:
              "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBkPSJNMTIgMkM2LjQ4IDIgMiA2LjQ4IDIgMTJzNC40OCAxMCAxMCAxMCAxMC00LjQ4IDEwLTEwUzE3LjUyIDIgMTIgMnptMCAxOGMtNC40IDAtOC0zLjYtOC04czMuNi04IDgtOCA4IDMuNiA4IDgtMy42IDgtOCA4eiIgZmlsbD0iIzY2N2VlYSIvPjwvc3ZnPg==",
            iconSize: [32, 32],
            iconAnchor: [16, 16],
          }),
        });

        marker.bindPopup(`<strong>${vehicle.vehicleName}</strong>`);
        marker.addTo(this.map);
        this.markers[vehicle._id] = marker;
      });
    },
    updateVehicleMarker(vehicle) {
      this.clearAllMarkers();
      const [lng, lat] = vehicle.currentLocation.coordinates;
      const marker = L.marker([lat, lng], {
        title: vehicle.vehicleName,
        icon: L.icon({
          iconUrl:
            "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBkPSJNMTIgMkM3LjU4IDIgNCA1LjU4IDQgMTBjMCA1LjI1IDggMTIgOCAxMnM4LTYuNzUgOC0xMmMwLTQuNDItMy41OC04LTgtOHptMCA2YTIgMiAwIDAxMCA0IDIgMiAwIDAxMC00eiIgZmlsbD0iI2UwMDAwMCIvPjwvc3ZnPg==",
          iconSize: [40, 40],
          iconAnchor: [20, 40],
          popupAnchor: [0, -40],
        }),
      });

      marker.bindPopup(`<strong>${vehicle.vehicleName}</strong>`);
      marker.addTo(this.map);
      this.markers[vehicle._id] = marker;
    },
    clearAllMarkers() {
      Object.values(this.markers).forEach((marker) => {
        this.map.removeLayer(marker);
      });
      this.markers = {};
    },
    drawGeofences(geofences) {
      geofences.forEach((geofence) => {
        const coordinates = geofence.geometry.coordinates[0].map(([lng, lat]) => [lat, lng]);

        const polygon = L.polygon(coordinates, {
          color: "#667eea",
          weight: 2,
          opacity: 0.7,
          fillOpacity: 0.2,
        });

        polygon.bindPopup(`<strong>${geofence.name}</strong>`);
        polygon.addTo(this.map);
        this.geofencePolygons[geofence._id] = polygon;
      });
    },
    toggleTracking() {
      if (this.isTracking) {
        clearInterval(this.trackingInterval);
        this.isTracking = false;
      } else {
        this.isTracking = true;
        this.updateVehicleLocation();
        this.trackingInterval = setInterval(() => {
          this.updateVehicleLocation();
        }, 3000); // Update every 3 seconds
      }
    },
    async updateVehicleLocation() {
      if (!this.selectedVehicleId) return;

      try {
        const response = await api.get(`/vehicles/${this.selectedVehicleId}`);
        if (response.data.success) {
          const vehicle = response.data.vehicle;
          const [lng, lat] = vehicle.currentLocation.coordinates;

          if (this.markers[vehicle._id]) {
            this.markers[vehicle._id].setLatLng([lat, lng]);
          }

          this.selectedVehicleInfo = vehicle;
        }
      } catch (error) {
        console.error("Failed to update vehicle location:", error);
      }
    },
    centerMapOnVehicle(vehicle) {
      const [lng, lat] = vehicle.currentLocation.coordinates;
      this.map.setView([lat, lng], 15);
    },
  },
};
</script>

<style scoped>
.vehicle-map-container {
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.map-controls {
  padding: 1.5rem;
  border-bottom: 1px solid #ddd;
}

.map-controls h1 {
  margin: 0 0 1rem 0;
  color: #2c3e50;
}

.controls {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.vehicle-select {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
  max-width: 400px;
}

.btn {
  background-color: #667eea;
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.3s;
}

.btn:hover {
  background-color: #764ba2;
}

.btn.tracking {
  background-color: #e74c3c;
}

.btn.tracking:hover {
  background-color: #c0392b;
}

#map {
  height: 500px;
  width: 100%;
}
</style>
