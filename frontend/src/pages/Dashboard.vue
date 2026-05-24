<template>
  <div class="dashboard">
    <h1>Dashboard</h1>
    <div v-if="loading" class="loading">Loading...</div>
    <div v-else class="stats-grid">
      <StatCard title="Total Kendaraan" :value="stats.totalVehicles" />
      <StatCard title="Kendaraan Aktif" :value="stats.activeVehicles" />
      <StatCard title="Total Pembatasan Area (Geofence)" :value="stats.totalGeofences" />
      <StatCard title="Pencerobohan" :value="stats.todayViolations" />
    </div>
  </div>
</template>

<script>
import api from "../services/api";
import StatCard from "../components/dashboard/StatCard.vue";

export default {
  name: "Dashboard",
  components: {
    StatCard,
  },
  data() {
    return {
      stats: {
        totalVehicles: 0,
        activeVehicles: 0,
        totalGeofences: 0,
        todayViolations: 0,
      },
      loading: true,
    };
  },
  mounted() {
    this.fetchStats();
    // Refresh stats every 5 seconds
    this.statsInterval = setInterval(this.fetchStats, 5000);
  },
  beforeUnmount() {
    clearInterval(this.statsInterval);
  },
  methods: {
    async fetchStats() {
      try {
        const response = await api.getDashboardStats();
        if (response.data.success) {
          this.stats = response.data.stats;
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
.dashboard {
  background: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.dashboard h1 {
  margin-bottom: 2rem;
  color: #2c3e50;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.loading {
  text-align: center;
  padding: 2rem;
  color: #666;
}
</style>
