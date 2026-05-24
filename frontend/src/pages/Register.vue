<template>
  <div class="register-container">
    <div class="register-card">
      <h1>Daftar</h1>
      <form @submit.prevent="handleRegister">
        <div class="form-group">
          <label for="name">Nama:</label>
          <input v-model="form.name" type="text" id="name" required />
        </div>
        <div class="form-group">
          <label for="email">Email:</label>
          <input v-model="form.email" type="email" id="email" required />
        </div>
        <div class="form-group">
          <label for="password">Kata Sandi:</label>
          <input v-model="form.password" type="password" id="password" required />
        </div>
        <button type="submit" :disabled="loading">{{ loading ? "Sedang Mendaftar..." : "Daftar" }}</button>
        <p class="error" v-if="error">{{ error }}</p>
      </form>
      <p>
        Sudah punya akun?
        <router-link to="/login">Masuk di Sini</router-link>
      </p>
    </div>
  </div>
</template>

<script>
import api from "../services/api";

export default {
  name: "Register",
  data() {
    return {
      form: {
        name: "",
        email: "",
        password: "",
      },
      loading: false,
      error: "",
    };
  },
  methods: {
    async handleRegister() {
      this.loading = true;
      this.error = "";

      try {
        const response = await api.post("/auth/register", this.form);
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        this.$router.push("/dashboard");
      } catch (error) {
        this.error = error.response?.data?.message || "Registration failed";
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.register-card {
  background: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 400px;
}

.register-card h1 {
  text-align: center;
  color: #333;
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #333;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
}

button {
  width: 100%;
  padding: 0.75rem;
  background-color: #667eea;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;
  margin-top: 1rem;
}

button:hover:not(:disabled) {
  background-color: #764ba2;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error {
  color: #e74c3c;
  margin-top: 1rem;
  text-align: center;
}

p {
  text-align: center;
  margin-top: 1.5rem;
  color: #666;
}

a {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
}

a:hover {
  text-decoration: underline;
}
</style>
