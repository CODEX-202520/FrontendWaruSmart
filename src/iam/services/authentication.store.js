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
                router.push({ name: 'control-panel' });
            } catch (error) {
                console.error(error);
                router.push({ name: 'sign-in' });
            }
        },

        async signUp(signUpRequest, router, redirectRoute = 'control-panel') {
            try {
                const response = await authenticationService.signUp(signUpRequest);
                const signUpResponse = new SignUpResponse(response.data.message);

                console.log('SignUp Response:', signUpResponse);

                // Esperar un momento para asegurarse de que el usuario se haya creado correctamente
                await new Promise(resolve => setTimeout(resolve, 1000));

                // Crear un nuevo objeto para el inicio de sesión
                const signInRequest = {
                    username: signUpRequest.username,
                    password: signUpRequest.password
                };

                // Intentar iniciar sesión
                try {
                    await this.signIn(signInRequest, router);
                    router.push({ name: redirectRoute });
                } catch (signInError) {
                    console.error('Error en el inicio de sesión después del registro:', signInError);
                    // Si falla el inicio de sesión, mostrar un mensaje al usuario
                    alert('Registro exitoso. Por favor, intente iniciar sesión manualmente.');
                    router.push({ name: 'sign-in' });
                }
            } catch (error) {
                console.error('Error en el registro:', error);
                alert('Error en el registro: ' + (error.response?.data?.message || 'Por favor intente nuevamente'));
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