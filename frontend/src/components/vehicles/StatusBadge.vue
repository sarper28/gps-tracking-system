<template>
  <div class="badge" :class="statusClass">
    <span class="status-icon">{{ statusIcon }}</span>
    <span class="status-text">{{ status.toUpperCase() }}</span>
  </div>
</template>

<script>
export default {
  name: "StatusBadge",
  props: {
    status: {
      type: String,
      default: "normal",
    },
  },
  computed: {
    statusClass() {
      return `badge-${this.status}`;
    },
    statusIcon() {
      const icons = {
        penalty: "🔴",
        warning: "🟠",
        normal: "🟢",
      };
      return icons[this.status] || "🟢";
    },
  },
};
</script>

<style scoped>
.badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.9rem;
}

.badge-normal {
  background: #d4edda;
  color: #155724;
}

.badge-warning {
  background: #fff3cd;
  color: #856404;
}

.badge-penalty {
  background: #f8d7da;
  color: #721c24;
}

.status-icon {
  font-size: 1.2rem;
}
</style>
