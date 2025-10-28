<template>
  <pv-dialog
      v-model:visible="dialogVisible"
      :style="{ width: '450px' }"
      header="Registro de Auditoría"
      :modal="true"
      class="p-fluid">

    <div class="field">
      <label for="description">Descripción</label>
      <pv-textarea
          id="description"
          v-model="audit.description"
          required="true"
          rows="3"
          :class="{ 'p-invalid': submitted && !audit.description }"
      />
      <small class="p-error" v-if="submitted && !audit.description">La descripción es requerida.</small>
    </div>

    <div class="field">
      <label for="soilMoisture">Humedad del Suelo (%)</label>
      <pv-input-number
          id="soilMoisture"
          v-model="audit.soilMoisture"
          mode="decimal"
          :min="0"
          :max="100"
          :class="{ 'p-invalid': submitted && !audit.soilMoisture }"
      />
      <small class="p-error" v-if="submitted && !audit.soilMoisture">La humedad del suelo es requerida.</small>
    </div>

    <div class="field">
      <label for="soilTemperature">Temperatura del Suelo (°C)</label>
      <pv-input-number
          id="soilTemperature"
          v-model="audit.soilTemperature"
          mode="decimal"
          :class="{ 'p-invalid': submitted && !audit.soilTemperature }"
      />
      <small class="p-error" v-if="submitted && !audit.soilTemperature">La temperatura del suelo es requerida.</small>
    </div>

    <div class="field">
      <label for="airTemperature">Temperatura del Ambiente (°C)</label>
      <pv-input-number
          id="airTemperature"
          v-model="audit.airTemperature"
          mode="decimal"
          :class="{ 'p-invalid': submitted && !audit.airTemperature }"
      />
      <small class="p-error" v-if="submitted && !audit.airTemperature">La temperatura del ambiente es requerida.</small>
    </div>

    <div class="field">
      <label for="airHumidity">Humedad del Ambiente (%)</label>
      <pv-input-number
          id="airHumidity"
          v-model="audit.airHumidity"
          mode="decimal"
          :min="0"
          :max="100"
          :class="{ 'p-invalid': submitted && !audit.airHumidity }"
      />
      <small class="p-error" v-if="submitted && !audit.airHumidity">La humedad del ambiente es requerida.</small>
    </div>

    <div class="field">
      <label for="image">Imagen</label>
      <pv-file-upload
          mode="basic"
          name="image"
          accept="image/*"
          :maxFileSize="1000000"
          @select="onImageSelect"
          :auto="true"
          chooseLabel="Seleccionar Imagen"
      />
    </div>

    <template #footer>
      <pv-button
          label="Cancelar"
          icon="pi pi-times"
          class="p-button-text"
          @click="hideDialog"
      />
      <pv-button
          label="Guardar"
          icon="pi pi-check"
          class="p-button-text"
          @click="saveAudit"
      />
    </template>
  </pv-dialog>
</template>

<script>
import { AuditTrailApiService } from '../services/audit-trail-api.service';

export default {
  name: "audit-trail-dialog",
  props: {
    visible: {
      type: Boolean,
      required: true
    },
    sowingId: {
      type: Number,
      required: true
    },
    currentPhase: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      auditService: null,
      audit: {
        description: '',
        soilMoisture: null,
        soilTemperature: null,
        airTemperature: null,
        airHumidity: null,
        imageUrl: null
      },
      submitted: false
    }
  },
  computed: {
    dialogVisible: {
      get() {
        return this.visible;
      },
      set(value) {
        this.$emit('update:visible', value);
      }
    }
  },
  created() {
    this.auditService = new AuditTrailApiService();
    console.log('Componente creado con currentPhase:', this.currentPhase);
  },
  watch: {
    currentPhase: {
      handler(newVal) {
        console.log('currentPhase cambió a:', newVal);
      },
      immediate: true
    }
  },
  methods: {
    hideDialog() {
      this.submitted = false;
      this.dialogVisible = false;
      this.$emit('close');
    },
    async onImageSelect(event) {
      const file = event.files[0];
      // Aquí deberías implementar la lógica para subir la imagen a tu servidor
      // y obtener la URL
      this.audit.imageUrl = 'URL_DE_LA_IMAGEN';
    },
    async saveAudit() {
      this.submitted = true;
      console.log('Current Phase en saveAudit:', this.currentPhase);

      if (this.isValid()) {
        try {
          const auditData = {
            ...this.audit,
            sowingId: this.sowingId,
            phenologicalPhase: this.currentPhase
          };
          console.log('Datos completos a enviar:', auditData);
          
          const response = await this.auditService.createAudit(this.sowingId, auditData);

          this.$toast.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Auditoría registrada correctamente',
            life: 3000
          });

          this.$emit('saved', response.data);
          this.hideDialog();
        } catch (error) {
          console.error('Error al guardar la auditoría:', error);
          this.$toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo guardar la auditoría',
            life: 3000
          });
        }
      }
    },
    isValid() {
      return this.audit.description &&
          this.audit.soilMoisture !== null &&
          this.audit.soilTemperature !== null &&
          this.audit.airTemperature !== null &&
          this.audit.airHumidity !== null;
    }
  }
}
</script>

<style scoped>
</style>