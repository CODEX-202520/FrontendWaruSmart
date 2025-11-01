<script>
import {useAuthenticationStore} from "../services/authentication.store.js";
import {SignUpRequest} from "../model/sign-up.request.js";
import {SubscriptionApiService} from "../services/subscription-api.service.js";
import ProgressSpinner from 'primevue/progressspinner';

export default {
  name: "sign-up",
  components: {
    'pv-progress-spinner': ProgressSpinner
  },
  data() {
    return {
      username: '',
      password: '',
      subscriptionId: null,
      subscriptions: [],
      loading: true,
      colors: ["#005F40", "#9D7C58", "#9A5D4E"]
    };
  },
  methods: {
    async loadSubscriptions() {
      try {
        this.loading = true;
        const service = new SubscriptionApiService();
        const subscriptions = await service.getActive();
        
        if (!subscriptions || subscriptions.length === 0) {
          this.$toast.add({
            severity: 'warn',
            summary: 'Aviso',
            detail: 'No hay planes de suscripción disponibles en este momento.',
            life: 5000
          });
          this.subscriptions = [];
          return;
        }
        
        this.subscriptions = subscriptions;
      } catch (error) {
        console.error('Error loading subscriptions:', error);
        this.$toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los planes de suscripción. Por favor, intente nuevamente.',
          life: 5000
        });
        this.subscriptions = [];
      } finally {
        this.loading = false;
      }
    },
    onSignUp() {
      if (!this.subscriptionId) {
        this.$toast.add({
          severity: 'error',
          summary: 'Error',
          detail: this.$t('register.errorSelectPlan'),
          life: 3000,
        });
        return;
      }

      let authenticationStore = useAuthenticationStore();
      let signUpRequest = new SignUpRequest(this.username, this.password, this.subscriptionId);
      authenticationStore.signUp(signUpRequest, this.$router, this.$toast);
    }
  },
  created() {
    this.loadSubscriptions();
  }
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-logo">
      <img src="https://res.cloudinary.com/drkelnilg/image/upload/v1746768958/204444802d7973f55d70cc1211ef6b331c8b5245_pp9ifq.png" alt="Logo" />
    </div>
    <div class="register-container">
      <pv-card class="register-card">
        <template #title>
          <div class="card-header">
            <h3>{{$t('register.createAccount')}}</h3>
            <i class="pi pi-user-plus" style="font-size: 32px; color: #3E7C59;"></i>
          </div>
        </template>
        <template #content>
          <form @submit.prevent="onSignUp">
            <div class="form-group">
              <pv-float-label>
                <label for="username">{{$t('username')}}</label>
                <pv-input-text id="username" v-model="username" :class="{'p-invalid': !username}"/>
                <small v-if="!username" class="p-invalid">{{$t('usernameRequired')}}</small>
              </pv-float-label>
            </div>
            <br>
            <div class="form-group">
              <pv-float-label>
                <label for="password">{{$t('password')}}</label>
                <pv-input-text id="password" v-model="password" :class="{'p-invalid': !password}" type="password" />
                <small v-if="!password" class="p-invalid">{{$t('passwordRequired')}}</small>
              </pv-float-label>
            </div>

            <div class="subscription-section">
              <h4>{{$t('register.selectPlan')}}</h4>
              <div class="memberships-container">
                <pv-progress-spinner v-if="loading" />
                <div v-else class="memberships">
                  <pv-card
                    v-for="(subscription, index) in subscriptions"
                    :key="subscription.id"
                    class="membership-option"
                    :class="{ 'selected': subscriptionId === subscription.id }"
                    @click="subscriptionId = subscription.id"
                    :style="{ backgroundColor: colors[index % colors.length], color: '#fff' }"
                  >
                    <template #title>
                      <h2>{{ subscription.name }}</h2>
                    </template>
                    <template #content>
                      <p v-html="subscription.description.replace(/\n/g, '<br>')"></p>
                      <div class="subscription-price">
                        <span class="currency">S/</span>
                        <span class="amount">{{ subscription.price }}</span>
                        <span class="period">/ {{ subscription.durationInDays }} {{ $t('subscriptions.days') }}</span>
                      </div>
                    </template>
                  </pv-card>
                </div>
              </div>
              <small v-if="!subscriptionId" class="p-invalid">{{$t('register.pleaseSelectPlan')}}</small>
            </div>

            <div class="button-container">
              <button type="submit" class="auth-button">{{$t('signUp')}}</button>
            </div>
            <div class="auth-links">
              <p>{{$t('register.alreadyHaveAccount')}} <router-link to="/sign-in" class="auth-link">{{$t('signIn')}}</router-link></p>
            </div>
          </form>
        </template>
      </pv-card>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #f5f5f5;
  padding: 20px;
  overflow: hidden;
}

.auth-logo {
  margin-bottom: 2rem;
}

.auth-logo img {
  width: 200px;
  height: auto;
}

.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}

.register-card {
  width: 100%;
  max-width: 900px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.card-header {
  text-align: center;
  color: #3E7C59;
  margin-bottom: 1rem;
}

.card-header h3 {
  margin: 0;
  margin-bottom: 1rem;
  font-size: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.button-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  gap: 20px;
}

.auth-button {
  background-color: #3E7C59;
  padding: 12px 30px;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
  width: 100%;
}

.auth-button:hover {
  background-color: #2c5a40;
}

.auth-links {
  text-align: center;
  margin-top: 1rem;
}

.auth-link {
  color: #3E7C59;
  text-decoration: none;
  font-weight: bold;
}

.auth-link:hover {
  text-decoration: underline;
}

.p-float-label {
  text-align: left;
  display: flex;
  flex-direction: column;
  width: 100%;
}

.p-float-label label {
  margin-top: -1rem;
}

:deep(.p-inputtext) {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ced4da;
}

:deep(.p-inputtext:focus) {
  border-color: #3E7C59;
  box-shadow: 0 0 0 1px #3E7C59;
}

.p-float-label:has(input:focus) label,
.p-float-label:has(input.p-filled) label,
.p-float-label:has(input:-webkit-autofill) label,
.p-float-label:has(textarea:focus) label,
.p-float-label:has(textarea.p-filled) label,
.p-float-label:has(.p-inputwrapper-focus) label,
.p-float-label:has(.p-inputwrapper-filled) label {
  top: 0rem;
  font-size: 12px;
  color: #3E7C59;
}

.subscription-section {
  margin-top: 2rem;
  text-align: center;
}

.subscription-section h4 {
  color: #3E7C59;
  margin-bottom: 1rem;
  font-size: 1.5rem;
}

.memberships-container {
  width: 100%;
  overflow-x: auto;
  padding: 20px 0;
}

.memberships {
  display: flex;
  gap: 20px;
  padding: 0 20px;
  min-width: min-content;
  justify-content: center;
}

.membership-option {
  min-width: 250px;
  flex-shrink: 0;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 12px !important;
  overflow: hidden;
}

:deep(.membership-option .p-card-content) {
  padding: 1.5rem;
}

.membership-option.selected {
  transform: translateY(-5px);
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
}

.membership-option:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.subscription-price {
  display: flex;
  justify-content: center;
  align-items: baseline;
  gap: 0.5rem;
  margin-top: 1.5rem;
  background: rgba(255,255,255,0.1);
  padding: 1rem;
  border-radius: 8px;
}

.subscription-price .currency {
  font-size: 1.2rem;
  opacity: 0.9;
}

.subscription-price .amount {
  font-size: 2rem;
  font-weight: bold;
}

.subscription-price .period {
  font-size: 1rem;
  opacity: 0.8;
}

/* Estilos para el scroll horizontal */
.memberships-container::-webkit-scrollbar {
  height: 8px;
}

.memberships-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.memberships-container::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

.subscription-price .currency {
  font-size: 1rem;
  color: #3E7C59;
}

.subscription-price .amount {
  font-size: 1.5rem;
  font-weight: bold;
  color: #3E7C59;
}

.subscription-price .period {
  font-size: 0.9rem;
  color: #666;
}

@media (max-width: 480px) {
  .register-card {
    margin: 0;
  }
  
  .auth-logo img {
    width: 150px;
  }

  .subscription-cards {
    grid-template-columns: 1fr;
  }

  .subscription-card {
    margin: 0.5rem 0;
  }
}
</style>