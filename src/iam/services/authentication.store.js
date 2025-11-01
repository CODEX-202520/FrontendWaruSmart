import { AuthenticationService } from "./authentication.service.js";
import { defineStore } from "pinia";
import { SignInResponse } from "../model/sign-in.response.js";
import { SignUpResponse } from "../model/sign-up.response.js";

const authenticationService = new AuthenticationService();

export const useAuthenticationStore = defineStore({
    id: 'authentication',
    state: () => ({
        signedIn: localStorage.getItem('token') !== null, // Verifica si hay un token en localStorage
        userId: localStorage.getItem('userId') ? parseInt(localStorage.getItem('userId')) : 0, 
        username: localStorage.getItem('username') || '', 
        role: localStorage.getItem('role') || '',
    }),
    getters: {
        isSignedIn: (state) => state.signedIn,
        currentUserId: (state) => state.userId,
        currentUsername: (state) => state.username,
        currentUserRole: (state) => state.role,
        currentToken: () => localStorage.getItem('token'),
        isAdmin: (state) => state.role === 'ADMINISTRADOR_WARU_SMART',
    },
    actions: {
        async signIn(signInRequest, router) {
            try {
                const response = await authenticationService.signIn(signInRequest);
                const signInResponse = new SignInResponse(response.data.id, response.data.username, response.data.token);

                this.signedIn = true;
                this.userId = signInResponse.id;
                this.username = signInResponse.username;
                this.role = response.data.role || 'USUARIO';

                localStorage.setItem('token', signInResponse.token);
                localStorage.setItem('userId', signInResponse.id);
                localStorage.setItem('username', signInResponse.username);
                localStorage.setItem('role', this.role);

                console.log(signInResponse);
                
                // Primero redirigimos al panel de control
                return router.push({ name: 'control-panel' });
            } catch (error) {
                console.error(error);
                router.push({ name: 'sign-in' });
            }
        },

        async signUp(signUpRequest, router, toast) {
            try {
                const response = await authenticationService.signUp(signUpRequest);
                const signUpResponse = new SignUpResponse(response.data.message);

                console.log('SignUp Response:', signUpResponse);
                
                // Show success message using toast
                if (toast) {
                    toast.add({
                        severity: 'success',
                        summary: '¡Registro Exitoso!',
                        detail: 'Su cuenta ha sido creada. Por favor, inicie sesión.',
                        life: 5000
                    });
                }
                
                // Redirect to sign-in page
                router.push({ name: 'sign-in' });
            } catch (error) {
                console.error('Error en el registro:', error);
                if (toast) {
                    toast.add({
                        severity: 'error',
                        summary: 'Error en el registro',
                        detail: error.response?.data?.message || 'Por favor intente nuevamente',
                        life: 5000
                    });
                }
                router.push({ name: 'sign-up' });
            }
        },

        async signOut(router) {
            this.signedIn = false;
            this.userId = 0;
            this.username = '';
            this.role = '';

            // Limpia todo el localStorage
            localStorage.clear();

            // Redirige al usuario a la página de inicio de sesión
            router.push({ name: 'sign-in' });
        },
    },
});