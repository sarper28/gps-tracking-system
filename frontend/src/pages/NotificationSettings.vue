<template>
  <div class="notification-settings-container">
    <div class="page-header">
      <h1>Pengaturan Notifikasi</h1>
      <p>Konfigurasikan cara Anda menerima peringatan pencerobohan geofence</p>
    </div>

    <div v-if="loading" class="loading-state">
      <p>Loading settings...</p>
    </div>

    <div v-else class="settings-content">
      <!-- Email Channel -->
      <div class="channel-card">
        <div class="channel-header">
          <h2>Notifikasi Email</h2>
          <label class="toggle-switch">
            <input v-model="formData.email.enabled" type="checkbox" @change="onChannelToggle('email')" />
            <span :class="{ enabled: formData.email.enabled }">
              {{ formData.email.enabled ? "Enabled" : "Disabled" }}
            </span>
          </label>
        </div>

        <div v-if="formData.email.enabled" class="channel-config">
          <div class="form-group">
            <label>Email Address:</label>
            <input v-model="formData.email.address" type="email" placeholder="your.email@example.com" class="input-field" />
          </div>

          <div class="button-group">
            <button class="btn btn-primary" @click="testNotification('email')" :disabled="testingChannel === 'email' || !formData.email.address">
              {{ testingChannel === "email" ? "Testing..." : " Test Email" }}
            </button>
          </div>
        </div>
      </div>

      <!-- Telegram Channel -->
      <div class="channel-card">
        <div class="channel-header">
          <h2>Notifikasi Telegram</h2>
          <label class="toggle-switch">
            <input v-model="formData.telegram.enabled" type="checkbox" @change="onChannelToggle('telegram')" />
            <span :class="{ enabled: formData.telegram.enabled }">
              {{ formData.telegram.enabled ? "Enabled" : "Disabled" }}
            </span>
          </label>
        </div>

        <div v-if="formData.telegram.enabled" class="channel-config">
          <div class="form-group">
            <label>Bot Token:</label>
            <input v-model="formData.telegram.botToken" type="password" placeholder="123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11" class="input-field" />
            <small>Get this from @BotFather on Telegram</small>
          </div>

          <div class="form-group">
            <label>Chat ID:</label>
            <input v-model="formData.telegram.chatId" type="text" placeholder="123456789" class="input-field" />
            <small>Send /start to your bot, then forward the message to @userinfobot</small>
          </div>

          <div class="button-group">
            <button class="btn btn-primary" @click="testNotification('telegram')" :disabled="testingChannel === 'telegram' || !formData.telegram.botToken || !formData.telegram.chatId">
              {{ testingChannel === "telegram" ? "Testing..." : " Test Telegram" }}
            </button>
          </div>
        </div>
      </div>

      <!-- WhatsApp Channel -->
      <div class="channel-card">
        <div class="channel-header">
          <h2>Notifikasi WhatsApp</h2>
          <label class="toggle-switch">
            <input v-model="formData.whatsapp.enabled" type="checkbox" @change="onChannelToggle('whatsapp')" />
            <span :class="{ enabled: formData.whatsapp.enabled }">
              {{ formData.whatsapp.enabled ? "Enabled" : "Disabled" }}
            </span>
          </label>
        </div>

        <div v-if="formData.whatsapp.enabled" class="channel-config">
          <div class="form-group">
            <label>Webhook URL:</label>
            <input v-model="formData.whatsapp.webhookUrl" type="url" placeholder="https://webhook.example.com/whatsapp" class="input-field" />
            <small>Provide a URL that receives GPS violation webhooks</small>
          </div>

          <div class="button-group">
            <button class="btn btn-primary" @click="testNotification('whatsapp')" :disabled="testingChannel === 'whatsapp' || !formData.whatsapp.webhookUrl">
              {{ testingChannel === "whatsapp" ? "Testing..." : " Test WhatsApp" }}
            </button>
          </div>
        </div>
      </div>

      <!-- Save Button -->
      <div class="actions-section">
        <button class="btn btn-success btn-lg" @click="saveSettings" :disabled="saving">
          {{ saving ? "Saving..." : " Simpan Semua Pengaturan" }}
        </button>
        <button class="btn btn-secondary btn-lg" @click="resetForm">Reset</button>
      </div>

      <!-- Success Message -->
      <div v-if="successMessage" class="success-message">{{ successMessage }}</div>

      <!-- Error Message -->
      <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
    </div>
  </div>
</template>

<script>
import apiService from "../services/api";

export default {
  name: "NotificationSettings",
  data() {
    return {
      formData: {
        email: { enabled: false, address: "" },
        telegram: { enabled: false, botToken: "", chatId: "" },
        whatsapp: { enabled: false, webhookUrl: "" },
      },
      loading: false,
      saving: false,
      testingChannel: null,
      successMessage: "",
      errorMessage: "",
    };
  },
  mounted() {
    this.loadSettings();
  },
  methods: {
    async loadSettings() {
      try {
        this.loading = true;
        const response = await apiService.getNotificationConfig();
        this.formData = response.data.notifConfig || this.formData;
      } catch (error) {
        console.error("Error loading settings:", error);
        this.errorMessage = "Failed to load notification settings";
      } finally {
        this.loading = false;
      }
    },

    async saveSettings() {
      try {
        // Validate at least one channel is enabled
        const anyEnabled = this.formData.email.enabled || this.formData.telegram.enabled || this.formData.whatsapp.enabled;

        if (!anyEnabled) {
          this.errorMessage = "Please enable at least one notification channel";
          return;
        }

        // Validate enabled channels have required fields
        if (this.formData.email.enabled && !this.formData.email.address) {
          this.errorMessage = "Email address is required for Email channel";
          return;
        }

        if (this.formData.telegram.enabled && (!this.formData.telegram.botToken || !this.formData.telegram.chatId)) {
          this.errorMessage = "Bot token and Chat ID are required for Telegram";
          return;
        }

        if (this.formData.whatsapp.enabled && !this.formData.whatsapp.webhookUrl) {
          this.errorMessage = "Webhook URL is required for WhatsApp";
          return;
        }

        this.saving = true;
        this.errorMessage = "";
        this.successMessage = "";

        await apiService.updateNotificationConfig(this.formData);

        this.successMessage = "Notification settings saved successfully!";
        setTimeout(() => {
          this.successMessage = "";
        }, 3000);
      } catch (error) {
        console.error("Error saving settings:", error);
        this.errorMessage = error.response?.data?.message || "Failed to save settings";
      } finally {
        this.saving = false;
      }
    },

    async testNotification(channel) {
      try {
        // Validate channel config
        if (channel === "email" && !this.formData.email.address) {
          this.errorMessage = "Email address is required";
          return;
        }

        if (channel === "telegram" && (!this.formData.telegram.botToken || !this.formData.telegram.chatId)) {
          this.errorMessage = "Bot token and Chat ID are required";
          return;
        }

        if (channel === "whatsapp" && !this.formData.whatsapp.webhookUrl) {
          this.errorMessage = "Webhook URL is required";
          return;
        }

        this.testingChannel = channel;
        this.errorMessage = "";

        await apiService.testNotification(channel);

        this.successMessage = `Test notification sent via ${channel}!`;
        setTimeout(() => {
          this.successMessage = "";
        }, 3000);
      } catch (error) {
        console.error(`Error testing ${channel}:`, error);
        this.errorMessage = error.response?.data?.message || `Failed to send test ${channel}`;
      } finally {
        this.testingChannel = null;
      }
    },

    onChannelToggle(channel) {
      this.errorMessage = "";
      this.successMessage = "";
    },

    resetForm() {
      this.formData = {
        email: { enabled: false, address: "" },
        telegram: { enabled: false, botToken: "", chatId: "" },
        whatsapp: { enabled: false, webhookUrl: "" },
      };
      this.errorMessage = "";
      this.successMessage = "";
      this.loadSettings();
    },
  },
};
</script>

<style scoped>
.notification-settings-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
}

.page-header {
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 2rem;
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
}

.page-header p {
  color: #7f8c8d;
  margin: 0;
}

.loading-state {
  text-align: center;
  padding: 3rem 1rem;
  background: white;
  border-radius: 8px;
  color: #7f8c8d;
}

.settings-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.channel-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 2rem;
}

.channel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f0f0f0;
}

.channel-header h2 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.3rem;
}

.toggle-switch {
  display: flex;
  align-items: center;
  cursor: pointer;
  gap: 0.5rem;
}

.toggle-switch input {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.toggle-switch span {
  font-weight: 600;
  color: #e74c3c;
  font-size: 0.9rem;
}

.toggle-switch span.enabled {
  color: #27ae60;
}

.channel-config {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #2c3e50;
}

.input-field {
  padding: 0.75rem;
  border: 2px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.3s;
  font-family: monospace;
}

.input-field:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-group small {
  margin-top: 0.25rem;
  color: #7f8c8d;
  font-size: 0.85rem;
}

.button-group {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
  font-size: 0.95rem;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #764ba2;
  transform: translateY(-2px);
}

.btn-primary:disabled {
  background: #ccc;
  cursor: not-allowed;
  opacity: 0.6;
}

.btn-secondary {
  background: #95a5a6;
  color: white;
}

.btn-secondary:hover {
  background: #7f8c8d;
}

.btn-success {
  background: #27ae60;
  color: white;
}

.btn-success:hover:not(:disabled) {
  background: #229954;
}

.btn-success:disabled {
  background: #ccc;
  cursor: not-allowed;
  opacity: 0.6;
}

.btn-lg {
  padding: 1rem 2rem;
  font-size: 1rem;
}

.actions-section {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.success-message {
  background: #d4edda;
  color: #155724;
  padding: 1rem;
  border-radius: 4px;
  border-left: 4px solid #28a745;
  text-align: center;
}

.error-message {
  background: #f8d7da;
  color: #721c24;
  padding: 1rem;
  border-radius: 4px;
  border-left: 4px solid #f5c6cb;
  text-align: center;
}

@media (max-width: 768px) {
  .notification-settings-container {
    padding: 1rem;
  }

  .channel-card {
    padding: 1.5rem;
  }

  .channel-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .actions-section {
    flex-direction: column;
  }

  .btn-lg {
    width: 100%;
  }
}
</style>
