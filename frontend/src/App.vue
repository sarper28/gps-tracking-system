<template>
  <div id="app" class="app-container">
    <nav v-if="isAuthenticated" class="navbar">
      <div class="nav-brand">
        <h1>Sistem Pemantauan Kendaraan Berbasis GPS</h1>
      </div>
      <div class="nav-links">
        <router-link to="/dashboard" :class="{ active: $route.path === '/dashboard' }">Dashboard</router-link>
        <router-link to="/vehicles" :class="{ active: $route.path === '/vehicles' }">Kendaraan</router-link>
        <router-link to="/geofences" :class="{ active: $route.path === '/geofences' }">Geofences</router-link>
        <router-link to="/map" :class="{ active: $route.path === '/map' }">Map</router-link>
        <router-link to="/history" :class="{ active: $route.path === '/history' }">History</router-link>
        <router-link to="/notifications" :class="{ active: $route.path === '/notifications' }">Settings</router-link>
        <button @click="logout" class="logout-btn">Logout</button>
      </div>
    </nav>

    <div class="page-container">
      <router-view />
    </div>
  </div>
</template>

<script>
export default {
  name: "App",

  data() {
    return {
      isAuthenticated: !!localStorage.getItem("token"),
    };
  },

  created() {
    window.addEventListener("auth-change", this.updateAuth);
  },

  beforeUnmount() {
    window.removeEventListener("auth-change", this.updateAuth);
  },

  methods: {
    updateAuth() {
      this.isAuthenticated = !!localStorage.getItem("token");
    },

    logout() {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      this.updateAuth();

      this.$router.push("/login");
    },
  },
};
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.app-container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.navbar {
  width: 100%;
  background-color: #2c3e50;
  color: white;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.nav-brand h1 {
  font-size: 1.5rem;
  font-weight: bold;
}

.nav-links {
  display: flex;
  gap: 2rem;
  align-items: center;
}

.nav-links a {
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.nav-links a:hover,
.nav-links a.active {
  background-color: #3498db;
}

.logout-btn {
  background-color: #e74c3c;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.logout-btn:hover {
  background-color: #c0392b;
}

.page-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}
</style>
