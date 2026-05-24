<template>
  <BaseModal :title="isEdit ? 'Ubah Kendaraan' : 'Tambah Kendaraan'" @close="$emit('close')">
    <form @submit.prevent="submitForm">
      <div class="form-group">
        <label for="vehicleName">Nama Kendaraan:</label>
        <input v-model="form.vehicleName" type="text" id="vehicleName" required />
      </div>
      <div class="form-group">
        <label for="licensePlate">Nomor Plat:</label>
        <input v-model="form.licensePlate" type="text" id="licensePlate" required placeholder="Contoh: B 1234 ABC" />
      </div>
      <div class="form-group" v-if="!isEdit">
        <label for="deviceId">ID Perangkat:</label>
        <input v-model="form.deviceId" type="text" id="deviceId" required />
      </div>
      <div class="form-group">
        <label for="isActive">
          <input v-model="form.isActive" type="checkbox" id="isActive" />
          Aktif
        </label>
      </div>
      <div class="modal-actions">
        <button type="submit" class="btn-primary">{{ isEdit ? "Perbarui" : "Buat" }}</button>
        <button type="button" @click="$emit('close')" class="btn-secondary">Batal</button>
      </div>
    </form>
  </BaseModal>
</template>

<script>
import BaseModal from "../common/BaseModal.vue";

export default {
  name: "VehicleModal",
  components: {
    BaseModal,
  },
  props: {
    vehicle: {
      type: Object,
      default: null,
    },
  },
  emits: ["close", "submit"],
  data() {
    return {
      form: {
        vehicleName: "",
        licensePlate: "",
        deviceId: "",
        isActive: true,
      },
    };
  },
  computed: {
    isEdit() {
      return !!this.vehicle;
    },
  },
  mounted() {
    if (this.vehicle) {
      this.form = {
        vehicleName: this.vehicle.vehicleName,
        licensePlate: this.vehicle.licensePlate,
        deviceId: this.vehicle.deviceId,
        isActive: this.vehicle.isActive,
      };
    }
  },
  methods: {
    submitForm() {
      this.$emit("submit", this.form);
    },
  },
};
</script>

<style scoped>
.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #333;
  font-weight: 500;
}

.form-group input[type="text"] {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
  box-sizing: border-box;
}

.form-group input[type="checkbox"] {
  margin-right: 0.5rem;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.modal-actions button {
  flex: 1;
  padding: 0.75rem;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.3s;
}

.btn-primary {
  background-color: #667eea;
  color: white;
}

.btn-primary:hover {
  background-color: #764ba2;
}

.btn-secondary {
  background-color: #95a5a6;
  color: white;
}

.btn-secondary:hover {
  background-color: #7f8c8d;
}
</style>
