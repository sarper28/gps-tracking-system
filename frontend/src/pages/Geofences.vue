<template>
  <div class="geofences-container">
    <div class="header">
      <h1>Manajamen Pembatasan Area (Geofence)</h1>
      <div class="header-actions">
        <button @click="showDrawing = true" class="btn-toggle">Create Geofence</button>
      </div>
    </div>

    <!-- Geofence Creation Section -->
    <div v-if="showDrawing" class="creation-section">
      <!-- Vehicle Selector -->
      <div class="vehicle-selector-section">
        <h3>Step 1: Pilih Kendaraan</h3>
        <div class="vehicle-selector">
          <label for="vehicleSelect">Kendaraan:</label>
          <select v-model="selectedVehicleId" id="vehicleSelect" class="input-field select-field" required>
            <option value="">-- Pilih Kendaraan --</option>
            <option v-for="vehicle in vehicles" :key="vehicle._id" :value="vehicle._id">{{ vehicle.vehicleName }} ({{ vehicle.licensePlate }})</option>
          </select>
          <p v-if="selectedVehicleId" class="vehicle-info">✅ {{ getSelectedVehicleName() }}</p>
        </div>
      </div>

      <!-- Geofence Type Selector -->
      <div class="type-selector" v-if="selectedVehicleId">
        <h3>Step 2: Pilih Tipe Geofence</h3>
        <div class="selector-tabs">
          <button @click="selectedMode = 'polygon'" :class="{ active: selectedMode === 'polygon' }" class="tab-button">📍 Polygon Geofence</button>
          <button @click="selectedMode = 'province'" :class="{ active: selectedMode === 'province' }" class="tab-button">📍 Province Geofence</button>
        </div>
      </div>

      <!-- Map Section -->
      <div class="map-section">
        <div id="geofence-map" class="geofence-map"></div>

        <!-- Polygon Mode -->
        <div v-if="selectedMode === 'polygon'" class="map-controls">
          <div class="controls-group">
            <p><strong>Instruksi Menggambar:</strong></p>
            <ul>
              <li>Click on the map to add vertices</li>
              <li>Double-click to finish drawing</li>
              <li>Minimum 3 vertices required</li>
            </ul>
          </div>
          <div v-if="drawnCoordinates.length > 0" class="drawn-info">
            <p><strong>Vertices:</strong> {{ drawnCoordinates.length }}</p>
            <button @click="clearDrawing" class="btn-secondary btn-small">Clear Drawing</button>
          </div>
        </div>

        <!-- Province Mode -->
        <div v-if="selectedMode === 'province'" class="map-controls">
          <div class="controls-group">
            <p><strong>Select Province:</strong></p>
            <select v-model="selectedProvince" class="input-field select-field" @change="onProvinceChange">
              <option value="">-- Choose Province --</option>
              <option v-for="prov in provinces" :key="prov.name" :value="prov.name">
                {{ prov.name }}
              </option>
            </select>
            <p v-if="selectedProvince" class="province-info">✅ {{ selectedProvince }} boundary loaded</p>
          </div>
        </div>
      </div>

      <!-- Polygon Save Section -->
      <div v-if="selectedMode === 'polygon' && drawnCoordinates.length > 0" class="save-section">
        <h3>Save Polygon Geofence</h3>
        <div class="save-form">
          <input v-model="newGeofence.name" type="text" placeholder="Geofence Name" class="input-field" />
          <textarea v-model="newGeofence.description" placeholder="Description (optional)" class="input-field" rows="3"></textarea>
          <label class="checkbox-label">
            <input v-model="newGeofence.isActive" type="checkbox" />
            Active
          </label>
          <button @click="saveDrawnGeofence" class="btn-primary btn-wide" :disabled="!newGeofence.name">Save Polygon Geofence</button>
        </div>
      </div>

      <!-- Province Save Section -->
      <div v-if="selectedMode === 'province' && selectedProvince" class="save-section">
        <h3>Save Province Geofence</h3>
        <div class="save-form">
          <input v-model="newGeofence.name" type="text" placeholder="Geofence Name (e.g., 'Jakarta Operations')" class="input-field" />
          <textarea v-model="newGeofence.description" placeholder="Description (optional)" class="input-field" rows="3"></textarea>
          <label class="checkbox-label">
            <input v-model="newGeofence.isActive" type="checkbox" />
            Active
          </label>
          <button @click="saveProvinceGeofence" class="btn-primary btn-wide" :disabled="!newGeofence.name || !selectedProvince">Save Province Geofence</button>
        </div>
      </div>
    </div>

    <!-- Edit Modal -->
    <div v-if="isEditMode && editingGeofence" class="modal-overlay" @click="cancelEdit">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Edit Geofence: {{ editingGeofence.name }}</h2>
          <button @click="cancelEdit" class="btn-close">&times;</button>
        </div>

        <!-- Edit Map Section -->
        <div class="edit-map-section">
          <div id="edit-geofence-map" class="geofence-map"></div>

          <!-- Polygon Edit Mode -->
          <div v-if="editingGeofence.type === 'polygon'" class="map-controls">
            <div class="controls-group">
              <p><strong>Edit Polygon:</strong></p>
              <ul>
                <li>Clear and redraw the polygon</li>
                <li>Click on map to add vertices</li>
                <li>Double-click to finish</li>
              </ul>
            </div>
            <div v-if="editDrawnCoordinates.length > 0" class="drawn-info">
              <p><strong>Vertices:</strong> {{ editDrawnCoordinates.length }}</p>
              <button @click="clearEditDrawing" class="btn-secondary btn-small">Clear Drawing</button>
            </div>
          </div>

          <!-- Province Edit Mode -->
          <div v-if="editingGeofence.type === 'province'" class="map-controls">
            <div class="controls-group">
              <p><strong>Change Province:</strong></p>
              <select v-model="editSelectedProvince" class="input-field select-field" @change="onEditProvinceChange">
                <option value="">-- Choose Province --</option>
                <option v-for="prov in provinces" :key="prov.name" :value="prov.name">
                  {{ prov.name }}
                </option>
              </select>
              <p v-if="editSelectedProvince" class="province-info">✅ {{ editSelectedProvince }} boundary loaded</p>
            </div>
          </div>
        </div>

        <!-- Edit Form Section -->
        <div class="modal-form-section">
          <h3>Update Details</h3>
          <div class="save-form">
            <div>
              <label class="form-label">Name</label>
              <input v-model="editingGeofence.name" type="text" class="input-field" />
            </div>
            <div>
              <label class="form-label">Description</label>
              <textarea v-model="editingGeofence.description" class="input-field" rows="3"></textarea>
            </div>
            <label class="checkbox-label">
              <input v-model="editingGeofence.isActive" type="checkbox" />
              Active
            </label>

            <div class="modal-actions">
              <button @click="cancelEdit" class="btn-secondary">Cancel</button>
              <button @click="saveEditGeofence" class="btn-primary" :disabled="!editingGeofence.name">Save Changes</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Geofences List -->
    <div class="geofences-list-section">
      <h2>Geofence Anda</h2>

      <div v-if="loading" class="loading">Loading geofences...</div>

      <div v-else-if="geofences.length === 0" class="empty-state">
        <p>Tidak ada geofence yang ditemukan. Buat geofence baru untuk memulai.</p>
      </div>

      <div v-else class="geofences-grid">
        <div v-for="geofence in geofences" :key="geofence._id" class="geofence-card">
          <div class="card-header">
            <div class="header-content">
              <h3>{{ geofence.name }}</h3>
              <span class="type-badge" :class="geofence.type">
                {{ geofence.type === "province" ? "📍 Province" : "🔹 Polygon" }}
              </span>
            </div>
            <span :class="{ active: geofence.isActive, inactive: !geofence.isActive }" class="status-badge">
              {{ geofence.isActive ? "Active" : "Inactive" }}
            </span>
          </div>

          <p v-if="geofence.description" class="description">{{ geofence.description }}</p>
          <p v-if="geofence.type === 'province'" class="meta">Province: {{ geofence.provinceName }}</p>
          <p v-else class="meta">{{ geofence.geometry.coordinates[0]?.length || 0 }} vertices</p>
          <p class="meta"><strong>Vehicle:</strong> {{ getVehicleNameById(geofence.vehicleId) }}</p>

          <div class="card-actions">
            <button @click="startEdit(geofence)" class="btn-small btn-edit">✏ Edit</button>
            <button @click="toggleGeofence(geofence)" :class="{ active: geofence.isActive }" class="btn-small">
              {{ geofence.isActive ? "⏸ Deactivate" : "▶ Activate" }}
            </button>
            <button @click="deleteGeofence(geofence._id)" class="btn-small btn-danger">Delete</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import L from "leaflet";
import "leaflet-draw/dist/leaflet.draw.css";
import "leaflet-draw";
import apiService from "../services/api";

export default {
  name: "Geofences",
  data() {
    return {
      vehicles: [],
      geofences: [],
      loading: true,
      showDrawing: false,
      map: null,
      drawnItems: null,
      drawControl: null,
      drawnCoordinates: [],
      selectedMode: "polygon",
      selectedProvince: "",
      selectedVehicleId: "",
      provinces: [],
      provinceLayer: null,
      newGeofence: {
        name: "",
        description: "",
        isActive: true,
        type: "polygon",
      },
      geofenceMarkers: {},
      isEditMode: false,
      editingGeofence: null,
      editMap: null,
      editDrawnItems: null,
      editDrawControl: null,
      editDrawnCoordinates: [],
      editProvinceLayer: null,
      editSelectedProvince: "",
    };
  },
  mounted() {
    this.fetchVehicles();
    this.fetchGeofences();
    this.fetchProvinces();
  },
  watch: {
    showDrawing(newVal) {
      if (newVal) {
        this.$nextTick(() => {
          this.initializeMap();
        });
      }
    },
    selectedMode() {
      this.clearDrawing();
      this.selectedProvince = "";
      if (this.provinceLayer) {
        this.map.removeLayer(this.provinceLayer);
        this.provinceLayer = null;
      }
    },
  },
  methods: {
    async fetchVehicles() {
      try {
        const response = await apiService.getVehicles();
        this.vehicles = response.data.vehicles || [];
      } catch (error) {
        console.error("Error fetching vehicles:", error);
      }
    },

    async fetchGeofences() {
      try {
        const response = await apiService.getGeofences();
        this.geofences = response.data.geofences || [];
      } catch (error) {
        console.error("Error fetching geofences:", error);
        alert("Failed to load geofences");
      } finally {
        this.loading = false;
      }
    },

    getSelectedVehicleName() {
      const vehicle = this.vehicles.find((v) => v._id === this.selectedVehicleId);
      return vehicle ? vehicle.vehicleName : "";
    },

    getVehicleNameById(vehicleId) {
      const vehicle = this.vehicles.find((v) => v._id === vehicleId);
      return vehicle ? `${vehicle.vehicleName} (${vehicle.licensePlate})` : "Unknown";
    },

    async fetchProvinces() {
      try {
        const response = await apiService.get("/geofences/provinces");
        this.provinces = response.data.provinces || [];
      } catch (error) {
        console.error("Error fetching provinces:", error);
      }
    },

    initializeMap() {
      if (this.map) return;

      this.$nextTick(() => {
        this.map = L.map("geofence-map").setView([-6.2088, 106.8456], 8);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "© OpenStreetMap contributors",
          maxZoom: 19,
        }).addTo(this.map);

        this.drawnItems = new L.FeatureGroup();
        this.map.addLayer(this.drawnItems);

        if (this.selectedMode === "polygon") {
          this.drawControl = new L.Control.Draw({
            draw: {
              polygon: true,
              polyline: false,
              rectangle: false,
              circle: false,
              marker: false,
              circlemarker: false,
            },
            edit: false,
            remove: false,
          });
          this.map.addControl(this.drawControl);

          this.map.on("draw:created", (e) => {
            const layer = e.layer;
            const coords = layer.toGeoJSON().geometry.coordinates[0];
            this.drawnCoordinates = coords.map(([lon, lat]) => [lat, lon]);
          });
        }

        this.loadGeofencesOnMap();
      });
    },

    loadGeofencesOnMap() {
      if (!this.map) return;

      this.geofences.forEach((geofence) => {
        if (geofence.type === "polygon" && geofence.geometry.coordinates[0]) {
          const coords = geofence.geometry.coordinates[0];
          const latLngCoords = coords.map(([lon, lat]) => [lat, lon]);

          const polygon = L.polygon(latLngCoords, {
            color: geofence.isActive ? "#667eea" : "#ccc",
            fillColor: geofence.isActive ? "#667eea" : "#ddd",
            fillOpacity: 0.3,
            weight: 2,
          });

          polygon.bindPopup(`<strong>${geofence.name}</strong><br/>Polygon<br/>${geofence.description || ""}`);
          polygon.addTo(this.map);

          this.geofenceMarkers[geofence._id] = polygon;
        }
      });
    },

    async onProvinceChange() {
      if (this.provinceLayer) {
        this.map.removeLayer(this.provinceLayer);
      }

      if (this.selectedProvince) {
        await this.renderProvinceOnMap();
      }
    },

    async renderProvinceOnMap() {
      try {
        const response = await apiService.get(`/geofences/provinces/${this.selectedProvince}/geometry`);
        const geometry = response.data.geometry;

        if (geometry.type === "Polygon") {
          const coords = geometry.coordinates[0];
          const latLngCoords = coords.map(([lon, lat]) => [lat, lon]);

          this.provinceLayer = L.polygon(latLngCoords, {
            color: "#27ae60",
            fillColor: "#27ae60",
            fillOpacity: 0.2,
            weight: 2,
          });

          this.provinceLayer.addTo(this.map);
        } else if (geometry.type === "MultiPolygon") {
          const featureGroup = L.featureGroup();

          geometry.coordinates.forEach((polygon) => {
            const coords = polygon[0];
            const latLngCoords = coords.map(([lon, lat]) => [lat, lon]);

            const poly = L.polygon(latLngCoords, {
              color: "#27ae60",
              fillColor: "#27ae60",
              fillOpacity: 0.2,
              weight: 2,
            });

            featureGroup.addLayer(poly);
          });

          featureGroup.addTo(this.map);
          this.provinceLayer = featureGroup;
        }

        if (this.map && geometry.coordinates) {
          this.map.fitBounds(this.provinceLayer.getBounds());
        }
      } catch (error) {
        console.error("Error loading province geometry:", error);
        alert("Failed to load province boundary. Please try again.");
      }
    },

    clearDrawing() {
      this.drawnCoordinates = [];
      if (this.drawnItems) {
        this.drawnItems.clearLayers();
      }
      this.newGeofence = { name: "", description: "", isActive: true, type: "polygon" };
      this.selectedVehicleId = "";
    },

    async saveDrawnGeofence() {
      try {
        if (!this.newGeofence.name) {
          alert("Please enter a geofence name");
          return;
        }

        if (!this.selectedVehicleId) {
          alert("Please select a vehicle");
          return;
        }

        if (this.drawnCoordinates.length < 3) {
          alert("A polygon must have at least 3 vertices");
          return;
        }

        const coordinates = this.drawnCoordinates.map(([lat, lng]) => [lng, lat]);

        const geofenceData = {
          name: this.newGeofence.name,
          description: this.newGeofence.description,
          coordinates,
          vehicleId: this.selectedVehicleId,
          isActive: this.newGeofence.isActive,
          type: "polygon",
        };

        await apiService.post("/geofences", geofenceData);
        alert("Polygon geofence created successfully!");
        this.clearDrawing();
        this.showDrawing = false;
        this.fetchGeofences();
      } catch (error) {
        console.error("Error saving geofence:", error);
        alert(error.response?.data?.message || "Failed to save geofence");
      }
    },

    async saveProvinceGeofence() {
      try {
        if (!this.newGeofence.name) {
          alert("Please enter a geofence name");
          return;
        }

        if (!this.selectedProvince) {
          alert("Please select a province");
          return;
        }

        if (!this.selectedVehicleId) {
          alert("Please select a vehicle");
          return;
        }

        const geofenceData = {
          name: this.newGeofence.name,
          description: this.newGeofence.description,
          provinceName: this.selectedProvince,
          vehicleId: this.selectedVehicleId,
          isActive: this.newGeofence.isActive,
          type: "province",
        };

        await apiService.post("/geofences", geofenceData);
        alert("Province geofence created successfully!");
        this.clearDrawing();
        this.selectedProvince = "";
        this.showDrawing = false;
        this.fetchGeofences();
      } catch (error) {
        console.error("Error saving province geofence:", error);
        alert(error.response?.data?.message || "Failed to save geofence");
      }
    },

    async toggleGeofence(geofence) {
      try {
        const updated = { ...geofence, isActive: !geofence.isActive };
        await apiService.put(`/geofences/${geofence._id}`, { isActive: updated.isActive });
        geofence.isActive = updated.isActive;
        this.updateGeofenceOnMap(geofence);
      } catch (error) {
        console.error("Error toggling geofence:", error);
        alert("Failed to update geofence");
      }
    },

    updateGeofenceOnMap(geofence) {
      if (this.geofenceMarkers[geofence._id]) {
        this.geofenceMarkers[geofence._id].setStyle({
          color: geofence.isActive ? "#667eea" : "#ccc",
          fillColor: geofence.isActive ? "#667eea" : "#ddd",
        });
      }
    },

    async deleteGeofence(geofenceId) {
      if (confirm("Are you sure you want to delete this geofence?")) {
        try {
          await apiService.delete(`/geofences/${geofenceId}`);
          alert("Geofence deleted successfully");
          this.fetchGeofences();
        } catch (error) {
          console.error("Error deleting geofence:", error);
          alert("Failed to delete geofence");
        }
      }
    },

    startEdit(geofence) {
      this.isEditMode = true;
      this.editingGeofence = { ...geofence };
      this.editDrawnCoordinates = [];
      this.editSelectedProvince = geofence.type === "province" ? geofence.provinceName : "";

      this.$nextTick(() => {
        this.initializeEditMap();
      });
    },

    cancelEdit() {
      this.isEditMode = false;
      this.editingGeofence = null;
      this.editDrawnCoordinates = [];
      this.editSelectedProvince = "";
      if (this.editMap) {
        this.editMap.remove();
        this.editMap = null;
      }
    },

    initializeEditMap() {
      if (this.editMap) return;

      this.$nextTick(() => {
        const mapElement = document.getElementById("edit-geofence-map");
        if (!mapElement) return;

        this.editMap = L.map("edit-geofence-map").setView([-6.2088, 106.8456], 8);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "© OpenStreetMap contributors",
          maxZoom: 19,
        }).addTo(this.editMap);

        this.editDrawnItems = new L.FeatureGroup();
        this.editMap.addLayer(this.editDrawnItems);

        if (this.editingGeofence.type === "polygon") {
          this.editDrawControl = new L.Control.Draw({
            draw: {
              polygon: true,
              polyline: false,
              rectangle: false,
              circle: false,
              marker: false,
              circlemarker: false,
            },
            edit: false,
            remove: false,
          });
          this.editMap.addControl(this.editDrawControl);

          this.editMap.on("draw:created", (e) => {
            const layer = e.layer;
            const coords = layer.toGeoJSON().geometry.coordinates[0];
            this.editDrawnCoordinates = coords.map(([lon, lat]) => [lat, lon]);
          });

          this.loadExistingPolygon();
        } else if (this.editingGeofence.type === "province") {
          this.loadExistingProvince();
        }
      });
    },

    loadExistingPolygon() {
      if (!this.editMap || !this.editingGeofence.geometry.coordinates[0]) return;

      const coords = this.editingGeofence.geometry.coordinates[0];
      const latLngCoords = coords.map(([lon, lat]) => [lat, lon]);

      const polygon = L.polygon(latLngCoords, {
        color: "#667eea",
        fillColor: "#667eea",
        fillOpacity: 0.3,
        weight: 2,
      });

      polygon.addTo(this.editMap);
      this.editMap.fitBounds(polygon.getBounds());
    },

    loadExistingProvince() {
      if (!this.editingGeofence.provinceName) return;
      this.editSelectedProvince = this.editingGeofence.provinceName;
      this.loadProvinceOnEditMap();
    },

    async loadProvinceOnEditMap() {
      try {
        const response = await apiService.get(`/geofences/provinces/${this.editSelectedProvince}/geometry`);
        const geometry = response.data.geometry;

        if (this.editProvinceLayer) {
          this.editMap.removeLayer(this.editProvinceLayer);
        }

        if (geometry.type === "Polygon") {
          const coords = geometry.coordinates[0];
          const latLngCoords = coords.map(([lon, lat]) => [lat, lon]);

          this.editProvinceLayer = L.polygon(latLngCoords, {
            color: "#27ae60",
            fillColor: "#27ae60",
            fillOpacity: 0.2,
            weight: 2,
          });

          this.editProvinceLayer.addTo(this.editMap);
        } else if (geometry.type === "MultiPolygon") {
          const featureGroup = L.featureGroup();

          geometry.coordinates.forEach((polygon) => {
            const coords = polygon[0];
            const latLngCoords = coords.map(([lon, lat]) => [lat, lon]);

            const poly = L.polygon(latLngCoords, {
              color: "#27ae60",
              fillColor: "#27ae60",
              fillOpacity: 0.2,
              weight: 2,
            });

            featureGroup.addLayer(poly);
          });

          featureGroup.addTo(this.editMap);
          this.editProvinceLayer = featureGroup;
        }

        if (this.editProvinceLayer) {
          this.editMap.fitBounds(this.editProvinceLayer.getBounds());
        }
      } catch (error) {
        console.error("Error loading province geometry:", error);
      }
    },

    async onEditProvinceChange() {
      if (this.editProvinceLayer) {
        this.editMap.removeLayer(this.editProvinceLayer);
      }

      if (this.editSelectedProvince) {
        await this.loadProvinceOnEditMap();
      }
    },

    clearEditDrawing() {
      this.editDrawnCoordinates = [];
      if (this.editDrawnItems) {
        this.editDrawnItems.clearLayers();
      }
    },

    async saveEditGeofence() {
      try {
        if (!this.editingGeofence.name) {
          alert("Please enter a geofence name");
          return;
        }

        const updateData = {
          name: this.editingGeofence.name,
          description: this.editingGeofence.description,
          isActive: this.editingGeofence.isActive,
        };

        if (this.editingGeofence.type === "polygon") {
          if (this.editDrawnCoordinates.length > 0) {
            if (this.editDrawnCoordinates.length < 3) {
              alert("A polygon must have at least 3 vertices");
              return;
            }
            const coordinates = this.editDrawnCoordinates.map(([lat, lng]) => [lng, lat]);
            updateData.coordinates = coordinates;
          }
        } else if (this.editingGeofence.type === "province") {
          if (this.editSelectedProvince) {
            updateData.provinceName = this.editSelectedProvince;
          }
        }

        await apiService.put(`/geofences/${this.editingGeofence._id}`, updateData);
        alert("Geofence updated successfully!");
        this.cancelEdit();
        this.fetchGeofences();
      } catch (error) {
        console.error("Error updating geofence:", error);
        alert(error.response?.data?.message || "Failed to update geofence");
      }
    },
  },
};
</script>

<style scoped>
.geofences-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem;
  background: white;
  border-bottom: 2px solid #f0f0f0;
  margin-bottom: 0;
}

.header h1 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.8rem;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.btn-toggle {
  padding: 0.75rem 1.5rem;
  border: 2px solid #667eea;
  background: white;
  color: #667eea;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
}

.btn-toggle:hover,
.btn-toggle.active {
  background: #667eea;
  color: white;
}

.creation-section {
  background: white;
  padding: 2rem;
  margin-bottom: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.vehicle-selector-section {
  background: #f0f4ff;
  padding: 1.5rem;
  border-radius: 8px;
  border-left: 4px solid #667eea;
  margin-bottom: 2rem;
}

.vehicle-selector-section h3 {
  margin-top: 0;
  color: #2c3e50;
}

.vehicle-selector {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.vehicle-selector label {
  font-weight: 600;
  color: #2c3e50;
}

.vehicle-info {
  margin: 0.5rem 0 0 0 !important;
  color: #27ae60 !important;
  font-weight: 600;
}

.type-selector {
  margin-bottom: 2rem;
}

.selector-tabs {
  display: flex;
  gap: 1rem;
  border-bottom: 2px solid #f0f0f0;
}

.tab-button {
  padding: 1rem 1.5rem;
  border: none;
  background: transparent;
  color: #7f8c8d;
  cursor: pointer;
  font-weight: 600;
  border-bottom: 3px solid transparent;
  transition: all 0.3s;
}

.tab-button.active {
  color: #667eea;
  border-bottom-color: #667eea;
}

.tab-button:hover {
  color: #667eea;
}

.map-section {
  background: white;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.geofence-map {
  width: 100%;
  height: 500px;
  border: 2px solid #ddd;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

#edit-geofence-map {
  width: 100%;
  height: 600px;
  border: 2px solid #ddd;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.map-controls {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 1.5rem;
}

.edit-map-section .map-controls {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  margin-top: 1rem;
  margin-bottom: 0;
}

.controls-group {
  padding: 1rem;
  background: white;
  border-radius: 4px;
  border-left: 4px solid #667eea;
}

.controls-group p {
  margin: 0 0 0.5rem 0;
  font-weight: 600;
  color: #2c3e50;
}

.controls-group ul {
  margin: 0;
  padding-left: 1.5rem;
  color: #555;
}

.controls-group li {
  margin: 0.25rem 0;
  font-size: 0.9rem;
}

.drawn-info {
  background: white;
  padding: 1rem;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.drawn-info p {
  margin: 0;
  font-weight: 600;
  color: #2c3e50;
}

.province-info {
  margin: 0.5rem 0 0 0 !important;
  color: #27ae60 !important;
  font-weight: 600;
}

.select-field {
  padding: 0.75rem;
  border: 2px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  font-family: inherit;
}

.save-section {
  background: #e8f4f8;
  padding: 2rem;
  border-radius: 8px;
  border-left: 4px solid #3498db;
}

.save-section h3 {
  margin-top: 0;
  color: #2c3e50;
}

.save-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.input-field {
  padding: 0.75rem;
  border: 2px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  font-family: inherit;
  transition: border-color 0.3s;
}

.input-field:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-weight: 500;
  color: #2c3e50;
}

.checkbox-label input {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.btn-wide {
  padding: 0.75rem 1.5rem;
  width: 100%;
}

.btn-primary {
  background: #667eea;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.3s;
}

.btn-primary:hover:not(:disabled) {
  background: #764ba2;
}

.btn-primary:disabled {
  background: #ccc;
  cursor: not-allowed;
  opacity: 0.6;
}

.btn-secondary {
  background: #95a5a6;
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.3s;
  margin-top: 0.5rem;
}

.btn-secondary:hover {
  background: #7f8c8d;
}

.btn-small {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.3s;
}

.geofences-list-section {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.geofences-list-section h2 {
  margin-top: 0;
  color: #2c3e50;
}

.loading,
.empty-state {
  text-align: center;
  padding: 2rem 1rem;
  color: #7f8c8d;
}

.geofences-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.geofence-card {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid #ddd;
  transition: all 0.3s;
}

.geofence-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #ddd;
}

.header-content {
  flex: 1;
}

.card-header h3 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
}

.type-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  background: #ecf0f1;
  color: #2c3e50;
}

.type-badge.province {
  background: #d4edda;
  color: #155724;
}

.type-badge.polygon {
  background: #cce5ff;
  color: #004085;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}

.status-badge.active {
  background: #d4edda;
  color: #155724;
}

.status-badge.inactive {
  background: #f8d7da;
  color: #721c24;
}

.description {
  color: #555;
  margin: 0.5rem 0;
  font-size: 0.9rem;
}

.meta {
  color: #999;
  font-size: 0.9rem;
  margin: 0.5rem 0 1rem 0;
}

.card-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-small {
  flex: 1;
  padding: 0.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
  transition: all 0.3s;
  background: #667eea;
  color: white;
}

.btn-small:hover {
  background: #764ba2;
}

.btn-small.active {
  background: #27ae60;
}

.btn-small.btn-danger {
  background: #e74c3c;
}

.btn-small.btn-danger:hover {
  background: #c0392b;
}

.btn-small.btn-danger:hover {
  background: #c0392b;
}

.btn-edit {
  background: #3498db;
}

.btn-edit:hover {
  background: #2980b9;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  z-index: 1000;
  padding: 1rem;
  overflow-y: auto;
}

.modal-content {
  background: white;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  max-width: 1200px;
  width: 100%;
  margin: 2rem auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 2px solid #f0f0f0;
  flex-shrink: 0;
}

.modal-header h2 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.5rem;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #7f8c8d;
  transition: color 0.3s;
}

.btn-close:hover {
  color: #2c3e50;
}

.edit-map-section {
  padding: 1.5rem;
}

.modal-form-section {
  padding: 1.5rem;
  border-top: 2px solid #f0f0f0;
  background: #f8f9fa;
  flex-shrink: 0;
}

.modal-form-section h3 {
  margin-top: 0;
  color: #2c3e50;
}

.form-label {
  display: block;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

.modal-actions button {
  flex: 1;
  padding: 0.75rem;
}

@media (max-width: 768px) {
  .modal-content {
    max-width: 100%;
    max-height: 95vh;
  }

  .modal-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .btn-close {
    align-self: flex-end;
    margin: -1.5rem -1.5rem 0 0;
  }
}
</style>
