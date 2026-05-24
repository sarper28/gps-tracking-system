<template>
  <div class="stat-card">
    <h2>{{ title }}</h2>
    <p class="stat-value">{{ value }}</p>
  </div>
</template>

<script>
export default {
  name: "StatCard",
  props: {
    title: {
      type: String,
      required: true,
    },
    value: {
      type: [String, Number],
      required: true,
    },
  },
};
</script>

<style scoped>
.stat-card {
  background: linear-gradient(135deg, #667eea 0%, #4557dc 100%);
  color: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.stat-card h2 {
  font-size: 1rem;
  margin-bottom: 1rem;
  opacity: 0.9;
}

.stat-value {
  font-size: 2.5rem;
  font-weight: bold;
  margin: 0;
}
</style>
