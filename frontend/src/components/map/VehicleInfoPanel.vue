<template>
  <div v-if="vehicleInfo" class="vehicle-info">
    <h3>{{ vehicleInfo.vehicleName }}</h3>
    <p><strong>Device ID:</strong> {{ vehicleInfo.deviceId }}</p>
    <p><strong>Last Updated:</strong> {{ formatDate(vehicleInfo.lastUpdated) }}</p>
    <p>
      <strong>Coordinates:</strong> {{ vehicleInfo.currentLocation.coordinates[1] }},
      {{ vehicleInfo.currentLocation.coordinates[0] }}
    </p>
  </div>
</template>

<script>
export default {
  name: "VehicleInfoPanel",
  props: {
    vehicleInfo: {
      type: Object,
      default: null,
    },
  },
  methods: {
    formatDate(date) {
      return new Date(date).toLocaleString();
    },
  },
};
</script>

<style scoped>
.vehicle-info {
  padding: 1.5rem;
  background-color: #f8f9fa;
  border-top: 1px solid #ddd;
}

.vehicle-info h3 {
  margin-top: 0;
  color: #2c3e50;
}

.vehicle-info p {
  margin: 0.5rem 0;
  color: #555;
}
</style>
