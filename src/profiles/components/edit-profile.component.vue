<script>
import { ProfileApiService } from "../service/profile-api.service.js";
import { useToast } from "primevue/usetoast";
const profileApiService = new ProfileApiService();

export default {
  setup() {
    const toast = useToast();
    return { toast };
  },
  data() {
    return {
      profileId: null,
      newFirstName: '',
      newLastName: '',
      newEmail: '',
      newCountry: null,
      newCity: null,
      isEditable: false,
      countries: [
        { id: 1, name: 'Chile', cities: ['Santiago', 'Antofagasta', 'Concepción'] },
        { id: 2, name: 'Colombia', cities: ['Bogotá', 'Barranquilla', 'Medellin'] },
        { id: 3, name: 'Ecuador', cities: ['Guayaquil', 'Quito', 'Cuenca'] },
        { id: 4, name: 'Perú', cities: ['Lima', 'Arequipa', 'Trujillo'] },
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
  async mounted() {
    try {
      const userId = localStorage.getItem('userId');
      const response = await profileApiService.getUserProfileById(userId);
      const prof = response.data;
      
      // Cargar datos del perfil
      this.profileId = prof.id;
      const [firstName, ...lastNameParts] = prof.fullName.split(' ');
      this.newFirstName = firstName;
      this.newLastName = lastNameParts.join(' ');
      this.newEmail = prof.email;
      this.newCountry = prof.countryId;
      
      // Cargar ciudades del país y encontrar la ciudad correcta
      this.updateCities(prof.countryId);
      const cityMatch = this.allCities.find(c => c.id === prof.cityId);
      this.newCity = cityMatch ? cityMatch.id : null;
      // Actualizar ciudades basado en el país
      this.updateCities(this.newCountry);
    } catch (error) {
      console.error('Error obteniendo el perfil del usuario:', error);
      this.toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo cargar la información del perfil',
        life: 3000
      });
    }
  },
  watch: {
    newCountry(newVal) {
      this.updateCities(newVal);
    }
  },
  methods: {
    enableEdit() {
      this.isEditable = true;
    },
    async confirmApply() {
      if (!this.newFirstName || !this.newLastName || !this.newEmail || !this.newCountry || !this.newCity) {
        this.toast.add({
          severity: 'warn',
          summary: 'Campos incompletos',
          detail: 'Por favor complete todos los campos obligatorios.',
          life: 3000
        });
        return;
      }

      if (!this.newEmail.includes('@')) {
        this.toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Por favor ingrese un correo electrónico válido',
          life: 3000
        });
        return;
      }

      // Obtener la ciudad seleccionada para verificar su ID
      const selectedCity = this.allCities.find(c => c.id === this.newCity);
      if (!selectedCity) {
        this.toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Ciudad no válida',
          life: 3000
        });
        return;
      }

      // Verificar que la ciudad corresponda al país seleccionado
      if (selectedCity.countryId !== this.newCountry) {
        this.toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'La ciudad seleccionada no pertenece al país seleccionado',
          life: 3000
        });
        return;
      }

      const profileData = {
        fullName: `${this.newFirstName.trim()} ${this.newLastName.trim()}`,
        emailAddress: this.newEmail.trim().toLowerCase(),
        countryId: parseInt(this.newCountry, 10),
        cityId: selectedCity.id
      };

      try {
        await profileApiService.updateProfile(this.profileId, profileData);
        this.toast.add({
          severity: 'success',
          summary: 'Perfil actualizado',
          detail: 'Los cambios han sido guardados exitosamente',
          life: 3000
        });
        this.$router.push('/control-panel');
      } catch (error) {
        console.error('Error actualizando el perfil:', error);
        this.toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo actualizar el perfil. Por favor intente nuevamente.',
          life: 3000
        });
      }
    },

    signOut() {
      this.$router.push('/sign-in');
    },

    updateCities(countryId) {
      this.cities = this.allCities.filter(city => city.countryId === countryId);
    }
  }
};
</script>


<template>
  <div class="profile-wrapper">
    <pv-card class="profile-card">
      <template #title>
        <div class="profile-header">
          <h1 class="profile-title">{{ $t('myProfile') }}</h1>
        </div>
      </template>

      <template #content>
        <div class="profile-content">
          <!-- Columna de imagen y botón de editar -->
          <div class="profile-image-column">
            <img
                class="profile-avatar"
                alt="avatar"
                src="https://static.vecteezy.com/system/resources/thumbnails/002/318/271/small/user-profile-icon-free-vector.jpg"
            />
            <button class="edit-icon-button" @click="enableEdit">
              <i class="pi pi-pencil"></i> Editar perfil
            </button>
          </div>

          <!-- Columna de formulario -->
          <div class="profile-form-column">
            <!-- Fila de Nombre y Apellido -->
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">{{ $t('firstName') }}:</label>
                <div class="input-group">
                  <pv-input-text v-model="newFirstName" :disabled="!isEditable" class="form-input"/>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">{{ $t('lastName') }}:</label>
                <div class="input-group">
                  <pv-input-text v-model="newLastName" :disabled="!isEditable" class="form-input"/>
                </div>
              </div>
            </div>

            <!-- Fila de Email -->
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">{{ $t('email') }}:</label>
                <div class="input-group">
                  <pv-input-text v-model="newEmail" :disabled="!isEditable" class="form-input"/>
                </div>
              </div>
            </div>

            <hr class="divider" />

            <!-- País, Ciudad y Plan -->
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">{{ $t('country') }}:</label>
                <pv-dropdown v-model="newCountry" :options="countries" optionLabel="name" optionValue="id"
                             :disabled="!isEditable" class="form-input" />
              </div>

              <div class="form-group">
                <label class="form-label">{{ $t('city') }}:</label>
                <pv-dropdown v-model="newCity" :options="cities" optionLabel="name" optionValue="id"
                             :disabled="!isEditable" class="form-input" />
              </div>


            </div>

            <!-- Botones de acción -->
            <div class="button-container">
              <pv-button class="apply-button" @click="confirmApply">{{ $t('apply') }}</pv-button>
              <pv-button class="signout-button" @click="signOut()">{{ $t('signOut') }}</pv-button>
            </div>
          </div>
        </div>
      </template>
    </pv-card>
  </div>
</template>



<style scoped>
.profile-wrapper {
  display: flex;
  justify-content: center;
  margin: 30px 0;
}

.profile-card {
  width: 90%;
  max-width: 1100px;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  background-color: #fff;
}

.profile-header {
  padding: 20px 0;
  text-align: left;
  background-color: #ffffff;
  border-bottom: 1px solid #eee;
  padding-left: 30px;
}

.profile-title {
  font-size: 28px;
  font-weight: 700;
  color: #222;
}

.profile-content {
  display: flex;
  padding: 40px;
  gap: 50px;
}

.profile-image-column {
  flex: 0 0 180px;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-right: 20px;
}

.profile-avatar {
  width: 180px;
  height: 180px;
  border-radius: 50%;
  border: 3px solid #f0f0f0;
}

.edit-icon-button {
  margin-top: 15px;
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  color: #465aed;
  font-weight: 600;
}

.edit-icon-button:hover {
  text-decoration: underline;
}

.profile-form-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.form-row {
  display: flex;
  flex-wrap: wrap;
  gap: 30px;
}

.change-button {
  background-color: #ffffff;
  color: #465aed;
  border: 1px solid #ddd;
  padding: 0.5rem 1rem;
  border-radius: 5px;
}

.divider {
  border: none;
  border-top: 1px solid #eee;
  margin: 10px 0;
}

.button-container {
  display: flex;
  justify-content: start;
  gap: 15px;
  margin-top: 20px;
}

.apply-button {
  background-color: #005f40;
  color: white;
  border: none;
  padding: 0.6rem 1.5rem;
  border-radius: 4px;
}

.signout-button {
  background-color: #FF3439;
  color: white;
  border: none;
  padding: 0.6rem 1.5rem;
  border-radius: 4px;
}



@media (max-width: 768px) {
  .profile-content {
    flex-direction: column;
    padding: 20px;
  }

  .form-row {
    flex-direction: column;
  }
}
</style>


