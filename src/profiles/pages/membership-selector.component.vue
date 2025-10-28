<template>
  <div class="membership-selector">
    <h1 class="title">{{ $t('subscriptions.selectSubscription') }}</h1>
    <div class="memberships-container">
      <div class="memberships">
        <pv-card
          v-for="(membership, index) in memberships"
          :key="membership.id"
          class="membership-option"
          @click="isRegularUser ? selectMembership(membership) : null"
          :style="{ backgroundColor: colors[index % colors.length], color: '#fff' }"
        >
          <template #title>
            <h2>{{ membership.name }}</h2>
            <p v-if="profileSubscriptionId === membership.id" style="font-style: italic; color: white; background-color: gray; padding: 5px; border-radius: 5px;">
              {{ $t('subscriptions.currentPlan') }}
            </p>
          </template>
          <template #content>
            <p v-html="membership.description.replace(/\n/g, '<br>')"></p>
            <p><strong>$ {{ membership.price }}</strong></p>
            <p v-if="membership.durationInDays">{{ membership.durationInDays }} {{ $t('subscriptions.days') }}</p>
          </template>
          <template #footer v-if="isAdmin">
            <div class="admin-actions">
              <pv-button icon="pi pi-pencil" class="p-button-rounded p-button-text p-button-info" @click.stop="openEditDialog(membership)" v-tooltip.top="'Editar'" />
              <pv-button icon="pi pi-trash" class="p-button-rounded p-button-text p-button-danger" @click.stop="deleteSubscription(membership)" v-tooltip.top="'Eliminar'" />
            </div>
          </template>
        </pv-card>
      </div>

      <!-- Sección para usuarios regulares -->
      <div class="selected-details" v-if="isRegularUser && selectedMembership.id !== 0 && selectedMembership.id !== profileSubscriptionId">
        <h2>{{ $t('subscriptions.selectedSubscription') }}</h2>
        <p><strong>{{ selectedMembership.name }}</strong></p>
        <p>{{ selectedMembership.description }}</p>
        <p><strong>${{ selectedMembership.price }}</strong></p>
        <button class="confirm-button" @click="confirmSelection">{{ $t('subscriptions.confirm') }}</button>
      </div>

      <!-- Sección para administradores -->
      <div v-if="isAdmin" style="margin-top:2rem;">
        <pv-button label="Crear suscripción" icon="pi pi-plus" class="p-button-success" @click="openCreateDialog" />
      </div>

      <pv-dialog 
        v-model:visible="dialogVisible"
        :header="isEditMode ? 'Editar suscripción' : 'Crear suscripción'"
        :modal="true"
        :closable="true"
        class="subscription-dialog"
        :breakpoints="{'960px': '75vw', '640px': '95vw'}"
        :style="{width: '50vw'}"
      >
        <div class="form-container">
          <div class="field">
            <label for="name">Nombre *</label>
            <pv-input-text 
              id="name"
              v-model="subscriptionForm.name"
              :class="{'p-invalid': submitted && !subscriptionForm.name}"
              class="w-full"
            />
            <small v-if="submitted && !subscriptionForm.name" class="p-error">
              El nombre es requerido
            </small>
          </div>
          <div class="field">
            <label for="description">Descripción *</label>
            <pv-textarea 
              id="description"
              v-model="subscriptionForm.description"
              :class="{'p-invalid': submitted && !subscriptionForm.description}"
              rows="4"
              class="w-full"
            />
            <small v-if="submitted && !subscriptionForm.description" class="p-error">
              La descripción es requerida
            </small>
          </div>
          <div class="field-row">
            <div class="field">
              <label for="price">Precio *</label>
              <pv-input-number 
                id="price"
                v-model="subscriptionForm.price"
                :class="{'p-invalid': submitted && !subscriptionForm.price}"
                mode="currency"
                currency="USD"
                locale="en-US"
                class="w-full"
              />
              <small v-if="submitted && !subscriptionForm.price" class="p-error">
                El precio es requerido
              </small>
            </div>
            <div class="field">
              <label for="duration">Duración (días) *</label>
              <pv-input-number 
                id="duration"
                v-model="subscriptionForm.durationInDays"
                :class="{'p-invalid': submitted && !subscriptionForm.durationInDays}"
                :min="1"
                class="w-full"
              />
              <small v-if="submitted && !subscriptionForm.durationInDays" class="p-error">
                La duración es requerida
              </small>
            </div>
          </div>
        </div>
        <template #footer>
          <pv-button 
            label="Cancelar"
            icon="pi pi-times"
            class="p-button-text"
            @click="closeDialog"
          />
          <pv-button 
            label="Guardar"
            icon="pi pi-check"
            @click="saveSubscription"
          />
        </template>
      </pv-dialog>
    </div>
  </div>
</template>

<script>
import profileApiService from '../service/profile-api.service.js';
import { SubscriptionsApiService } from '../service/subscriptions-api.service.js';
import { useAuthenticationStore } from '../../iam/services/authentication.store.js';
import { useToast } from "primevue/usetoast";

export default {
  setup() {
    const toast = useToast();
    return { toast };
  },
  data() {
    return {
      profileSubscriptionId: null,
      memberships: [],
      selectedMembership: { id: 0, name: '', description: '', price: '' },
      colors: ["#005F40", "#9D7C58", "#9A5D4E"],
      dialogVisible: false,
      isEditMode: false,
      isUpdateMode: false,
      profileId: null,
      subscriptionForm: {
        id: null,
        name: '',
        description: '',
        price: null,
        durationInDays: 30,
        isActive: true
      },
      submitted: false
    };
  },
  computed: {
    isAdmin() {
      const store = useAuthenticationStore();
      return store.currentUserRole === 'ADMINISTRADOR_WARU_SMART';
    },
    isRegularUser() {
      const store = useAuthenticationStore();
      return ['AGRICULTOR', 'COOPERATIVA'].includes(store.currentUserRole);
    }
  },
  async mounted() {
    const userId = localStorage.getItem('userId');
    this.isUpdateMode = this.$route.query.mode === 'update';
    
    try {
      // Primero intentamos obtener las suscripciones disponibles
      const subscriptionsService = new SubscriptionsApiService();
      const subscriptionsResponse = await subscriptionsService.getAllSubscriptions();
      this.memberships = subscriptionsResponse;

      // Luego intentamos obtener el perfil si hay un userId
      if (userId) {
        try {
          const profileResponse = await profileApiService.getUserProfileById(userId);
          if (profileResponse.data) {
            this.profileSubscriptionId = profileResponse.data.subscriptionId;
            this.profileId = profileResponse.data.id;
          }
        } catch (error) {
          // Si es un nuevo usuario, esto es normal
          console.log('No profile found, might be a new user');
        }
      }
      
      if (this.isUpdateMode) {
        document.title = 'WaruSmart | Cambiar Plan';
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
      this.toast.add({
        severity: 'error',
        summary: 'Error',
        detail: this.$t('subscriptions.errorLoading'),
        life: 3000
      });
    }
  },
  methods: {
    selectMembership(membership) {
      if (membership.id === this.profileSubscriptionId) {
        this.toast.add({
          severity: 'info',
          summary: 'Info',
          detail: this.$t('subscriptions.alreadyCurrent'),
          life: 3000
        });
        return;
      }
      this.selectedMembership = Object.assign({}, membership);
    },
    async confirmSelection() {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        this.toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se encontró el ID del usuario. Por favor, inicia sesión primero.',
          life: 3000
        });
        this.$router.push('/login');
        return;
      }
      
      if (this.selectedMembership.id === 0) {
        this.toast.add({
          severity: 'warn',
          summary: 'Atención',
          detail: 'Por favor, selecciona una membresía antes de confirmar.',
          life: 3000
        });
        return;
      }

      if (this.isUpdateMode) {
        try {
          // Actualizar la suscripción del perfil existente
          await profileApiService.updateProfile(this.profileId, {
            subscriptionId: this.selectedMembership.id
          });
          
          this.toast.add({
            severity: 'success',
            summary: 'Plan actualizado',
            detail: 'Tu plan ha sido actualizado exitosamente',
            life: 3000
          });
          
          this.$router.push('/control-panel');
        } catch (error) {
          this.toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo actualizar el plan. Por favor intenta nuevamente.',
            life: 3000
          });
        }
      } else {
        // Modo creación de perfil
        this.$router.push({
          name: 'user-profile-create',
          query: { subscriptionId: this.selectedMembership.id }
        });
      }
    },
    openCreateDialog() {
      this.dialogVisible = true;
      this.isEditMode = false;
      this.subscriptionForm = {
        id: null,
        name: '',
        description: '',
        price: null,
        durationInDays: 30,
        isActive: true
      };
      this.submitted = false;
    },
    openEditDialog(membership) {
      this.dialogVisible = true;
      this.isEditMode = true;
      this.subscriptionForm = {
        id: membership.id,
        name: membership.name,
        description: membership.description,
        price: membership.price,
        durationInDays: membership.durationInDays,
        isActive: membership.isActive
      };
      this.submitted = false;
    },
    async saveSubscription() {
      this.submitted = true;
      if (!this.subscriptionForm.name || !this.subscriptionForm.description || !this.subscriptionForm.price || !this.subscriptionForm.durationInDays) {
        return;
      }
      const subscriptionsService = new SubscriptionsApiService();
      try {
        if (this.isEditMode) {
          await subscriptionsService.updateSubscription(this.subscriptionForm.id, this.subscriptionForm);
        } else {
          await subscriptionsService.createSubscription(this.subscriptionForm);
        }
        this.dialogVisible = false;
        this.memberships = await subscriptionsService.getAllSubscriptions();
      } catch (error) {
        alert('Error al guardar la suscripción.');
      }
    },
    async deleteSubscription(membership) {
      if (!confirm('¿Seguro que deseas eliminar esta suscripción?')) return;
      const subscriptionsService = new SubscriptionsApiService();
      try {
        await subscriptionsService.deleteSubscription(membership.id);
        this.memberships = await subscriptionsService.getAllSubscriptions();
      } catch (error) {
        alert('Error al eliminar la suscripción.');
      }
    },
    closeDialog() {
      this.dialogVisible = false;
      this.submitted = false;
    }
  }
};
</script>

<style scoped>
.membership-selector {
  text-align: center;
  padding: 20px;
}

.title {
  color: #000;
  margin-bottom: 2rem;
}

.memberships-container {
  width: 100%;
  overflow-x: auto;
  padding: 20px 0;
}

.memberships {
  display: flex;
  gap: 50px;
  padding: 0 20px;
  min-width: min-content;
}

.membership-option {
  border: 1px solid #ccc;
  padding: 20px;
  border-radius: 20px;
  min-width: 250px;
  flex-shrink: 0;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.membership-option.selected {
  background-color: #f0f0f0;
  border-color: #000;
}

.membership-option:hover {
  background-color: #f9f9f9;
}

.selected-details {
  color: black;
  margin-top: 20px;
  border: 1px solid #ccc;
  padding: 20px;
  border-radius: 10px;
}

.confirm-button {
  background-color: var(--primary-main-green);
  color: #fff;
  border: none;
  padding: 10px 20px;
  cursor: pointer;
}

.confirm-button:hover {
  background-color: #004D33;
}

/* Estilos específicos para administradores */
.admin-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1rem;
  background: white;
  padding: 8px;
  border-radius: 8px;
  border: 1px solid #000;
}

/* Botones del diálogo */
:deep(.p-dialog-footer) {
  .p-button {
    border: 1px solid #000;
    &.p-button-text {
      background-color: white;
      color: #000;
    }
  }
}

/* Estilos cuando el usuario es administrador */
:deep(.membership-option) {
  cursor: default;
}

/* Estilos cuando el usuario es regular */
.isRegularUser :deep(.membership-option) {
  cursor: pointer;
}

/* Estilos para el scroll horizontal */
.memberships-container {
  &::-webkit-scrollbar {
    height: 8px;
  }
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 4px;
  }
} 
</style>