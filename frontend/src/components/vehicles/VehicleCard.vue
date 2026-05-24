<template>
  <div class="vehicle-card">
    <div class="card-header">
      <h3>{{ vehicle.vehicleName }}</h3>
      <span :class="{ active: vehicle.isActive, inactive: !vehicle.isActive }" class="active-badge">
        {{ vehicle.isActive ? "Aktif" : "Tidak Aktif" }}
      </span>
    </div>

    <StatusBadge :status="vehicle.status || 'normal'" />

    <p><strong>ID Perangkat:</strong> {{ vehicle.deviceId }}</p>
    <p><strong>Nomor Plat:</strong> {{ vehicle.licensePlate }}</p>
    <p>
      <strong>Lokasi:</strong>
      {{ vehicle.currentLocation.coordinates[1].toFixed(4) }},
      {{ vehicle.currentLocation.coordinates[0].toFixed(4) }}
    </p>

    <div v-if="vehicle.status === 'warning' && vehicle.warningStartTime" class="warning-info">
      <p><strong>⏱️ Waktu Tersisa:</strong> {{ getRemainingTime(vehicle.warningStartTime) }}</p>
    </div>

    <div class="card-actions">
      <button @click="$emit('edit')" class="btn-secondary">Ubah</button>
      <button @click="$emit('delete')" class="btn-danger">Hapus</button>
    </div>
  </div>
</template>

<script>
import StatusBadge from "./StatusBadge.vue";

export default {
  name: "VehicleCard",
  components: {
    StatusBadge,
  },
  props: {
    vehicle: {
      type: Object,
      required: true,
    },
  },
  emits: ["edit", "delete"],
  methods: {
    getRemainingTime(warningStartTime) {
      if (!warningStartTime) return "N/A";
      const start = new Date(warningStartTime);
      const thirtyMinutesLater = new Date(start.getTime() + 30 * 60 * 1000);
      const now = new Date();
      const diff = thirtyMinutesLater - now;

      if (diff <= 0) return "Expired";

      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);

      return `${minutes}m ${seconds}s`;
    },
  },
};
</script>

<style scoped>
.vehicle-card {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid #ddd;
  transition:
    transform 0.3s,
    box-shadow 0.3s;
}

.vehicle-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.vehicle-card h3 {
  color: #2c3e50;
  margin-top: 0;
  margin-bottom: 0.5rem;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e0e0e0;
}

.active-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
}

.active-badge.active {
  background: #d4edda;
  color: #155724;
}

.active-badge.inactive {
  background: #f8d7da;
  color: #721c24;
}

.warning-info {
  background: #fff3cd;
  padding: 0.75rem;
  border-radius: 4px;
  border-left: 4px solid #ffc107;
  margin: 0.5rem 0 1rem 0;
}

.warning-info p {
  margin: 0;
  color: #856404;
  font-weight: 600;
}

.card-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

.card-actions button {
  flex: 1;
  padding: 0.5rem;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.3s;
}

.btn-secondary {
  background-color: #95a5a6;
  color: white;
}

.btn-secondary:hover {
  background-color: #7f8c8d;
}

.btn-danger {
  background-color: #e74c3c;
  color: white;
}

.btn-danger:hover {
  background-color: #c0392b;
}
</style>
