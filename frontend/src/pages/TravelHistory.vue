<template>
  <div class="travel-history-container">
    <div class="page-header">
      <h1>Riwayat Perjalanan</h1>
      <p>Lacak pembaruan lokasi dan pencerobohan geofence.</p>
    </div>

    <div class="controls-section">
      <div class="vehicle-selector">
        <label>Pilih Kendaraan:</label>
        <select v-model="selectedVehicleId" @change="onVehicleChange">
          <option value="">-- Pilih kendaraan Anda --</option>
          <option v-for="vehicle in vehicles" :key="vehicle._id" :value="vehicle._id">{{ vehicle.vehicleName }} ({{ vehicle.deviceId }})</option>
        </select>
      </div>

      <div class="tab-buttons">
        <button :class="{ active: activeTab === 'history' }" @click="activeTab = 'history'">Riwayat Lokasi</button>
        <button :class="{ active: activeTab === 'violations' }" @click="activeTab = 'violations'">Pencerobohan</button>
      </div>
    </div>

    <div v-if="!selectedVehicleId" class="empty-state">
      <p>Silakan pilih kendaraan untuk melihat riwayat perjalanannya.</p>
    </div>

    <div v-else>
      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <p>Loading history...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="historyItems.length === 0" class="empty-state">
        <p>No {{ activeTab === "violations" ? "violations" : "records" }} ditemukan untuk kendaraan ini.</p>
      </div>

      <!-- History Table -->
      <div v-else class="history-section">
        <table class="history-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Location</th>
              <th v-if="activeTab === 'history'">Accuracy</th>
              <th v-if="activeTab === 'history'">Speed</th>
              <th v-if="activeTab === 'violations'">Geofence(s)</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in historyItems" :key="item._id">
              <td class="timestamp">
                {{ formatDate(item.timestamp) }}
              </td>
              <td class="location">
                {{ formatCoordinates(item.location.coordinates) }}
              </td>
              <td v-if="activeTab === 'history'">
                {{ item.accuracy ? item.accuracy.toFixed(2) + " m" : "-" }}
              </td>
              <td v-if="activeTab === 'history'">
                {{ item.speed ? item.speed.toFixed(1) + " km/h" : "-" }}
              </td>
              <td v-if="activeTab === 'violations'" class="geofence-cell">
                <span v-for="(geofence, idx) in item.violatedGeofences" :key="idx" class="geofence-badge">
                  {{ geofence.name }}
                </span>
              </td>
              <td class="actions">
                <button class="btn-small view-map" @click="viewOnMap(item.location.coordinates)" title="View on map"></button>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Pagination Controls -->
        <div class="pagination">
          <button :disabled="currentPage === 1 || loading" @click="previousPage" class="btn-pagination">← Previous</button>

          <span class="page-info"> Page {{ currentPage }} of {{ totalPages }} ({{ totalItems }} total) </span>

          <button :disabled="currentPage === totalPages || loading" @click="nextPage" class="btn-pagination">Next →</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import apiService from "../services/api";

export default {
  name: "TravelHistory",
  data() {
    return {
      selectedVehicleId: "",
      vehicles: [],
      historyItems: [],
      activeTab: "history", // "history" or "violations"
      currentPage: 1,
      pageSize: 20,
      totalItems: 0,
      totalPages: 0,
      loading: false,
      vehiclesLoading: true,
    };
  },
  mounted() {
    this.fetchVehicles();
  },
  methods: {
    async fetchVehicles() {
      try {
        this.vehiclesLoading = true;
        const response = await apiService.getVehicles();
        this.vehicles = response.data.vehicles || [];
      } catch (error) {
        console.error("Error fetching vehicles:", error);
        alert("Failed to load vehicles");
      } finally {
        this.vehiclesLoading = false;
      }
    },

    async onVehicleChange() {
      this.currentPage = 1;
      if (this.selectedVehicleId) {
        this.fetchHistory();
      }
    },

    async fetchHistory() {
      try {
        this.loading = true;
        let response;

        if (this.activeTab === "violations") {
          response = await apiService.getViolationHistory(this.selectedVehicleId, this.currentPage, this.pageSize);
        } else {
          response = await apiService.getLocationHistory(this.selectedVehicleId, this.currentPage, this.pageSize);
        }

        this.historyItems = response.data.data || [];
        this.totalItems = response.data.pagination.totalItems;
        this.totalPages = response.data.pagination.totalPages;
      } catch (error) {
        console.error("Error fetching history:", error);
        alert("Failed to load history");
        this.historyItems = [];
      } finally {
        this.loading = false;
      }
    },

    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
        this.fetchHistory();
      }
    },

    previousPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
        this.fetchHistory();
      }
    },

    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleString();
    },

    formatCoordinates(coords) {
      return `${coords[1].toFixed(4)}, ${coords[0].toFixed(4)}`;
    },

    viewOnMap(coordinates) {
      // Open map with coordinates (can be enhanced with modal/popup)
      const googleMapsUrl = `https://www.google.com/maps/?q=${coordinates[1]},${coordinates[0]}`;
      window.open(googleMapsUrl, "_blank");
    },
  },

  watch: {
    activeTab() {
      this.currentPage = 1;
      if (this.selectedVehicleId) {
        this.fetchHistory();
      }
    },
  },
};
</script>

<style scoped>
.travel-history-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
}

.page-header {
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 2rem;
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
}

.page-header p {
  color: #7f8c8d;
  margin: 0;
}

.controls-section {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
  align-items: center;
}

.vehicle-selector {
  flex: 1;
  min-width: 250px;
}

.vehicle-selector label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
  color: #2c3e50;
}

.vehicle-selector select {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.vehicle-selector select:focus {
  outline: none;
  border-color: #667eea;
}

.tab-buttons {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.tab-buttons button {
  padding: 0.75rem 1.5rem;
  border: 2px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s;
}

.tab-buttons button:hover {
  border-color: #667eea;
  color: #667eea;
}

.tab-buttons button.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  background: white;
  border-radius: 8px;
  color: #7f8c8d;
}

.loading-state p,
.empty-state p {
  font-size: 1.1rem;
  margin: 0;
}

.history-section {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.history-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: auto;
}

.history-table thead {
  background: #f8f9fa;
  border-bottom: 2px solid #dee2e6;
}

.history-table th {
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.9rem;
}

.history-table tbody tr {
  border-bottom: 1px solid #dee2e6;
  transition: background-color 0.2s;
}

.history-table tbody tr:hover {
  background-color: #f8f9fa;
}

.history-table td {
  padding: 1rem;
  color: #2c3e50;
  font-size: 0.95rem;
}

.timestamp {
  color: #667eea;
  font-weight: 500;
  white-space: nowrap;
}

.location {
  font-family: monospace;
  color: #555;
  font-size: 0.9rem;
}

.geofence-cell {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.geofence-badge {
  display: inline-block;
  background: #fff3cd;
  color: #856404;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
}

.actions {
  text-align: center;
}

.btn-small {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 0.25rem 0.5rem;
  transition: transform 0.2s;
}

.btn-small:hover {
  transform: scale(1.2);
}

.view-map {
  color: #667eea;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1.5rem;
  padding: 1.5rem;
  background: #f8f9fa;
  border-top: 1px solid #dee2e6;
}

.btn-pagination {
  padding: 0.5rem 1rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.3s;
}

.btn-pagination:hover:not(:disabled) {
  background: #764ba2;
}

.btn-pagination:disabled {
  background: #ccc;
  cursor: not-allowed;
  opacity: 0.6;
}

.page-info {
  color: #666;
  font-weight: 500;
}

@media (max-width: 768px) {
  .travel-history-container {
    padding: 1rem;
  }

  .controls-section {
    flex-direction: column;
    gap: 1rem;
  }

  .vehicle-selector {
    width: 100%;
  }

  .history-table {
    font-size: 0.85rem;
  }

  .history-table th,
  .history-table td {
    padding: 0.75rem 0.5rem;
  }

  .pagination {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>
