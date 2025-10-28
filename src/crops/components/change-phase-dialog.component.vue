
<script>
import { AuditTrailApiService } from '../services/audit-trail-api.service';
import AuditTrailDialog from './audit-trail-dialog.component.vue';

export default {
  components: {
    'audit-trail-dialog': AuditTrailDialog
  },
  name: "change-phase-dialog",
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    sowingId: {
      type: Number,
      required: true
    },
    isHarvestReady: {
      type: Boolean,
      default: false
    },
    currentPhase: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      auditService: null,
      showAuditDialog: false
    }
  },
  created() {
    this.auditService = new AuditTrailApiService();
  },
  methods: {
    onNo() {
      this.$emit('update:visible', false);
      this.$emit('canceled');
    },
    onYes() {
      if (this.isHarvestReady) {
        this.downloadReport();
      } else {
        console.log('Fase fenológica actual antes de mostrar diálogo:', this.currentPhase);
        console.log('Props del componente:', {
          visible: this.visible,
          sowingId: this.sowingId,
          isHarvestReady: this.isHarvestReady,
          currentPhase: this.currentPhase
        });
        this.showAuditDialog = true;
      }
    },
    async downloadReport() {
      try {
        const response = await this.auditService.downloadReport(this.sowingId);
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `audit-trail-report-${this.sowingId}.pdf`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        this.$emit('update:visible', false);
        this.$emit('confirmed');
      } catch (error) {
        console.error('Error al descargar el reporte:', error);
        this.$toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo descargar el reporte',
          life: 3000
        });
      }
    },
    onAuditSaved() {
      this.showAuditDialog = false;
      this.$emit('update:visible', false);
      this.$emit('confirmed');
    }
  }
}
</script>


<template>
  <div>
    <pv-dialog :visible="visible" :header="isHarvestReady ? 'Descargar Reporte de Auditoría' : 'Cambiar Fase Fenológica'" :modal="true" :closable="false">
      <p v-if="isHarvestReady">¿Deseas descargar el reporte completo de auditoría de este cultivo?</p>
      <p v-else>Para cambiar la fase fenológica, necesitamos registrar una auditoría del estado actual del cultivo.</p>
      <template #footer>
        <pv-button label="No" class="no-button" @click="onNo" />
        <pv-button :label="isHarvestReady ? 'Descargar' : 'Continuar'" class="yes-button" @click="onYes" />
      </template>
    </pv-dialog>

    <audit-trail-dialog
        v-if="!isHarvestReady"
        v-model:visible="showAuditDialog"
        :sowing-id="sowingId"
        :current-phase="currentPhase"
        @saved="onAuditSaved"
        @close="showAuditDialog = false"
    />
  </div>
</template>

<style scoped>
.no-button {
  background-color: var(--primary-main-green);
  color: #fff;
}

.yes-button {
  background-color: #9D7C58;
  color: #fff;
}
</style>