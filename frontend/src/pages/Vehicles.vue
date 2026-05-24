<template>
  <div class="vehicles-container">
    <div class="header">
      <h1>Kendaraan</h1>
      <button @click="showAddVehicle = true" class="btn-primary">+ Tambah Kendaraan</button>
    </div>

    <div v-if="loading" class="loading">Memuat kendaraan...</div>

    <div v-else-if="vehicles.length === 0" class="empty-state">
      <p>Tidak ada kendaraan yang ditemukan. Klik "Tambah Kendaraan" untuk membuat kendaraan baru.</p>
    </div>

    <div v-else class="vehicles-grid">
      <VehicleCard v-for="vehicle in vehicles" :key="vehicle._id" :vehicle="vehicle" @edit="editVehicle" @delete="deleteVehicle" />
    </div>

    <VehicleModal v-if="showAddVehicle" :vehicle="editingVehicle" @close="closeModal" @submit="saveVehicle" />
  </div>
</template>

<script>
import api from "../services/api";
import VehicleCard from "../components/vehicles/VehicleCard.vue";
import VehicleModal from "../components/vehicles/VehicleModal.vue";

export default {
  name: "Vehicles",
  components: {
    VehicleCard,
    VehicleModal,
  },
  data() {
    return {
      vehicles: [],
      loading: true,
      showAddVehicle: false,
      editingVehicle: null,
    };
  },
  mounted() {
    this.fetchVehicles();
  },
  methods: {
    async fetchVehicles() {
      try {
        const response = await api.getVehicles();
        if (response.data.success) {
          this.vehicles = response.data.vehicles;
        }
      } catch (error) {
        console.error("Failed to fetch vehicles:", error);
        alert("Failed to fetch vehicles");
      } finally {
        this.loading = false;
      }
    },
    editVehicle(vehicle) {
      this.editingVehicle = vehicle;
      this.showAddVehicle = true;
    },
    async saveVehicle(form) {
      try {
        if (this.editingVehicle) {
          await api.updateVehicle(this.editingVehicle._id, form);
          alert("Vehicle updated successfully");
        } else {
          await api.createVehicle(form);
          alert("Vehicle created successfully");
        }
        this.closeModal();
        this.fetchVehicles();
      } catch (error) {
        alert(error.response?.data?.message || "Failed to save vehicle");
      }
    },
    async deleteVehicle(vehicleId) {
      if (confirm("Are you sure you want to delete this vehicle?")) {
        try {
          await api.deleteVehicle(vehicleId);
          alert("Vehicle deleted successfully");
          this.fetchVehicles();
        } catch (error) {
          alert("Failed to delete vehicle");
        }
      }
    },
    closeModal() {
      this.showAddVehicle = false;
      this.editingVehicle = null;
    },
  },
};
</script>

<style scoped>
.vehicles-container {
  background: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.header h1 {
  margin: 0;
  color: #2c3e50;
}

.btn-primary {
  background-color: #667eea;
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.3s;
}

.btn-primary:hover {
  background-color: #764ba2;
}

.vehicles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.loading,
.empty-state {
  text-align: center;
  padding: 2rem;
  color: #666;
}
</style>
