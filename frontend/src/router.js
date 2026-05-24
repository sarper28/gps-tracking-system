import { createRouter, createWebHistory } from "vue-router";
import Login from "./pages/Login.vue";
import Register from "./pages/Register.vue";
import Dashboard from "./pages/Dashboard.vue";
import Vehicles from "./pages/Vehicles.vue";
import Geofences from "./pages/Geofences.vue";
import VehicleMap from "./pages/VehicleMap.vue";
import TravelHistory from "./pages/TravelHistory.vue";
import NotificationSettings from "./pages/NotificationSettings.vue";

const routes = [
  { path: "/", redirect: "/login" },
  { path: "/login", component: Login, meta: { requiresAuth: false } },
  { path: "/register", component: Register, meta: { requiresAuth: false } },
  { path: "/dashboard", component: Dashboard, meta: { requiresAuth: true } },
  { path: "/vehicles", component: Vehicles, meta: { requiresAuth: true } },
  { path: "/geofences", component: Geofences, meta: { requiresAuth: true } },
  { path: "/map", component: VehicleMap, meta: { requiresAuth: true } },
  { path: "/history", component: TravelHistory, meta: { requiresAuth: true } },
  { path: "/notifications", component: NotificationSettings, meta: { requiresAuth: true } },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Guard to check authentication
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("token");
  const isAuthenticated = !!token;

  if (to.meta.requiresAuth && !isAuthenticated) {
    next("/login");
  } else if (!to.meta.requiresAuth && isAuthenticated && (to.path === "/login" || to.path === "/register")) {
    next("/dashboard");
  } else {
    next();
  }
});

export default router;
