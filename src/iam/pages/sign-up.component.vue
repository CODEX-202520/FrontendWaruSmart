<script>
import {useAuthenticationStore} from "../services/authentication.store.js";
import {SignUpRequest} from "../model/sign-up.request.js";

export default {
  name: "sign-up",
  data() {
    return {
      username: '',
      password: ''
    };
  },
  methods: {
    onSignUp() {
      let authenticationStore = useAuthenticationStore();
      let signUpRequest = new SignUpRequest(this.username, this.password);
      authenticationStore.signUp(signUpRequest, this.$router, 'membership-selector');
    }
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
            <h3>Crear una cuenta</h3>
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
            <div class="button-container">
              <button type="submit" class="auth-button">{{$t('signUp')}}</button>
            </div>
            <div class="auth-links">
              <p>¿Ya tienes una cuenta? <router-link to="/sign-in" class="auth-link">Iniciar sesión</router-link></p>
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
  max-width: 400px;
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

@media (max-width: 480px) {
  .register-card {
    margin: 0;
  }
  
  .auth-logo img {
    width: 150px;
  }
}
</style>