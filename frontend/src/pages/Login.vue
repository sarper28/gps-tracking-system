<template>
  <div class="login-container">
    <div class="login-card">
      <h1>Masuk</h1>
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="email">Email:</label>
          <input v-model="form.email" type="email" id="email" required />
        </div>
        <div class="form-group">
          <label for="password">Kata Sandi:</label>
          <input v-model="form.password" type="password" id="password" required />
        </div>
        <button type="submit" :disabled="loading">{{ loading ? "Sedang Masuk..." : "Masuk" }}</button>
        <p class="error" v-if="error">{{ error }}</p>
      </form>
      <p>
        Belum punya akun?
        <router-link to="/register">Daftar di Sini</router-link>
      </p>
    </div>
  </div>
</template>

<script>
import api from "../services/api";

export default {
  name: "Login",
  data() {
    return {
      form: {
        email: "",
        password: "",
      },
      loading: false,
      error: "",
    };
  },
  methods: {
    async handleLogin() {
      this.loading = true;
      this.error = "";

      try {
        const response = await api.loginUser(this.form);

        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));

        window.dispatchEvent(new Event("auth-change"));

        this.$router.push("/dashboard");
      } catch (error) {
        console.error(error);

        this.error = error.response?.data?.message || error.message || "Login failed";
      }
    },
  },
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: url("/foto bg.jpg");
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.login-card {
  background: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 400px;
}

.login-card h1 {
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
