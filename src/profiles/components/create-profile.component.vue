<template>
  <div class="profile-wrapper">
    <pv-card class="profile-card">
      <template #title>
        <div class="profile-header">
          <h1 class="profile-title">{{ $t('createProfile') }}</h1>
        </div>
      </template>
      <template #content>
        <div class="profile-content">
          <!-- Columna de la imagen -->
          <div class="profile-image-column">
            <img class="profile-avatar" alt="avatar"
                 src="https://static.vecteezy.com/system/resources/thumbnails/002/318/271/small/user-profile-icon-free-vector.jpg">
          </div>

          <!-- Columna del formulario -->
          <div class="profile-form-column">
            <!-- Fila de Nombre y Apellido -->
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">{{ $t('firstName') }}:</label>
                <div class="input-group">
                  <pv-input-text v-model="newFirstName" class="form-input"/>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">{{ $t('lastName') }}:</label>
                <div class="input-group">
                  <pv-input-text v-model="newLastName" class="form-input"/>
                </div>
              </div>
            </div>

            <!-- Fila de Email -->
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">{{ $t('email') }}:</label>
                <div class="input-group">
                  <pv-input-text v-model="newEmail" class="form-input"/>
                </div>
              </div>
            </div>

            <!-- Línea divisoria -->
            <hr class="divider"/>

            <!-- Fila de País y Ciudad -->
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">{{ $t('country') }}:</label>
                <div class="input-group">
                  <pv-dropdown
                      v-model.number="newCountry"
                      :options="countries"
                      optionLabel="name"
                      optionValue="id"
                      :placeholder="$t('selectCountry')"
                      class="form-input"
                  />
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">{{ $t('city') }}:</label>
                <div class="input-group">
                  <pv-dropdown
                      v-model.number="newCity"
                      :options="cities"
                      optionLabel="name"
                      optionValue="id"
                      :placeholder="$t('selectCity')"
                      class="form-input"
                      :disabled="!newCountry"
                  />
                </div>
              </div>
            </div>

            <!-- Botón de acción -->
            <div class="button-container">
              <pv-button class="apply-button" @click="confirmApply">{{ $t('apply') }}</pv-button>
            </div>
          </div>
        </div>
      </template>
    </pv-card>
  </div>
</template>

<script>
import { ProfileApiService } from "../service/profile-api.service.js";
import { useAuthenticationStore } from "../../iam/services/authentication.store.js";
import { useToast } from "primevue/usetoast";

const profileApiService = new ProfileApiService();

export default {
  setup() {
    const toast = useToast();
    return { toast };
  },
  data() {
    return {
      newFirstName: '',
      newLastName: '',
      newEmail: '',
      newCountry: null,
      newCity: null,
      countries: [
        { id: 1, name: 'Chile' },
        { id: 2, name: 'Colombia' },
        { id: 3, name: 'Ecuador' },
        { id: 4, name: 'Perú' },
      ],
      allCities: [
        // Chile (1)
        { id: 10, name: 'Santiago', countryId: 1 },
        { id: 20, name: 'Antofagasta', countryId: 1 },
        { id: 30, name: 'Concepción', countryId: 1 },
        // Colombia (2)
        { id: 40, name: 'Bogotá', countryId: 2 },
        { id: 50, name: 'Barranquilla', countryId: 2 },
        { id: 60, name: 'Medellin', countryId: 2 },
        // Ecuador (3)
        { id: 70, name: 'Guayaquil', countryId: 3 },
        { id: 80, name: 'Quito', countryId: 3 },
        { id: 90, name: 'Cuenca', countryId: 3 },
        // Perú (4)
        { id: 100, name: 'Lima', countryId: 4 },
        { id: 110, name: 'Arequipa', countryId: 4 },
        { id: 120, name: 'Trujillo', countryId: 4 },
      ],
      cities: []
    };
  },
  watch: {
    newCountry(newVal) {
      this.updateCities(newVal);
    }
  },
  methods: {
    updateCities(countryId) {
      this.cities = this.allCities.filter(city => city.countryId === countryId);
      this.newCity = null;
    },
    async confirmApply() {
      const userId = localStorage.getItem('userId');

      if (!userId) {
        this.toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo obtener el ID del usuario. Por favor, inicia sesión nuevamente.', life: 3000 });
        await this.$router.push('/sign-in');
        return;
      }

      if (!this.newFirstName || !this.newLastName || !this.newEmail || !this.newCountry || !this.newCity) {
        this.toast.add({ severity: 'warn', summary: 'Campos incompletos', detail: 'Por favor complete todos los campos obligatorios.', life: 3000 });
        return;
      }

      const selectedCity = this.allCities.find(c => c.id === this.newCity);
      if (!selectedCity || selectedCity.countryId !== this.newCountry) {
        this.toast.add({ severity: 'error', summary: 'Error', detail: 'La ciudad seleccionada no pertenece al país seleccionado.', life: 3000 });
        return;
      }

      // Subscription check removed as it's now handled in IAM

      // Validaciones adicionales
      if (!this.newEmail.includes('@')) {
        this.toast.add({ severity: 'error', summary: 'Error', detail: 'Por favor ingrese un correo electrónico válido', life: 3000 });
        return;
      }

      // Obtener el rol del usuario del store de autenticación
      const authStore = useAuthenticationStore();
      const userRole = authStore.currentUserRole;

      if (!userRole) {
        alert('No se pudo determinar el rol del usuario. Por favor, inicia sesión nuevamente.');
        this.$router.push('/sign-in');
        return;
      }

      // La variable selectedCity ya está definida arriba, así que usamos la misma referencia aquí

      const profileData = {
        firstName: this.newFirstName.trim(),
        lastName: this.newLastName.trim(),
        email: this.newEmail.trim().toLowerCase(),
        countryId: parseInt(this.newCountry, 10),
        cityId: selectedCity.id, // Usamos el ID correcto de la ciudad

        userId: parseInt(userId, 10),
        role: userRole
      };

      // Validar que todos los IDs sean números válidos
      if (isNaN(profileData.countryId) || 
          isNaN(profileData.cityId) || 
          isNaN(profileData.userId)) {
        alert('Error en los datos del formulario. Por favor, recarga la página e intenta nuevamente.');
        return;
      }

      /*
      * const profileData = {
  firstName: this.newFirstName.trim(),
  lastName: this.newLastName.trim(),
  email: this.newEmail.trim(),
  cityId: this.newCity,
  subscriptionId: 10,
  countryId: this.newCountry,
  userId: parseInt(userId, 10)
};
*/

      console.log('Enviando al backend:', JSON.stringify(profileData, null, 2));

      try {
        const response = await profileApiService.create(profileData);
        this.toast.add({
          severity: 'success',
          summary: '¡Perfil creado!',
          detail: 'Tu perfil ha sido creado exitosamente.',
          life: 3000
        });
        
        // Store the profile ID in localStorage if needed
        if (response.data?.id) {
          localStorage.setItem('profileId', response.data.id);
        }
        
        // Small delay to ensure the profile is registered in the backend
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Redirigir al panel de control después de crear el perfil
        await this.$router.push({ name: 'control-panel' });
      } catch (error) {
        console.error('Error al crear el perfil:', error.response?.data);
        let errorDetail = '';
        
        if (error.response?.data?.errors) {
          // Extraer mensajes específicos de validación
          errorDetail = Object.values(error.response.data.errors)
            .flat()
            .join(', ');
        } else if (error.response?.data?.title) {
          errorDetail = error.response.data.title;
        } else {
          errorDetail = 'Hubo un error al procesar tu solicitud. Por favor, intenta nuevamente.';
        }
        
        this.toast.add({
          severity: 'error',
          summary: 'Error al crear el perfil',
          detail: errorDetail,
          life: 5000
        });
      }
    }

  }
};
</script>

<style scoped>
.profile-wrapper {
  width: 100%;
  max-width: 1000px;
  margin: 20px auto;
}

.profile-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  background-color: #fff;
}

.profile-header {
  padding: 15px;
  border-bottom: 1px solid #eee;
  text-align: center;
  background-color: #f8f9fa;
}

.profile-title {
  font-size: 24px;
  font-weight: bold;
  margin: 0;
  color: #333;
}

.profile-content {
  display: flex;
  padding: 20px;
  gap: 30px;
}

.profile-image-column {
  flex: 0 0 auto;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.profile-avatar {
  width: 180px;
  height: 180px;
  border-radius: 50%;
  border: 3px solid #f0f0f0;
}

.profile-form-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-row {
  display: flex;
  gap: 20px;
}

.form-group {
  flex: 1;
  min-width: 0;
}

.form-label {
  display: block;
  font-weight: 600;
  margin-bottom: 8px;
  color: #555;
}

.input-group {
  display: flex;
  align-items: center;
}

.form-input {
  flex: 1;
  min-width: 0;
}

.divider {
  border: none;
  border-top: 1px solid #eee;
  margin: 0;
}

.button-container {
  display: flex;
  margin-top: 10px;
}

.apply-button {
  background-color: #005f40;
  color: white;
  border: none;
  padding: 0.6rem 1.5rem;
  border-radius: 4px;
}

@media (max-width: 768px) {
  .profile-content {
    flex-direction: column;
  }

  .form-row {
    flex-direction: column;
  }
}
</style>
