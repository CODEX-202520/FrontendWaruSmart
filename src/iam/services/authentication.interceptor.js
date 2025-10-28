import {useAuthenticationStore} from "./authentication.store.js";

export const authenticationInterceptor = (config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('Token added to request:', config.url);
    } else {
        console.log('No token available for request:', config.url);
    }
    return config;
}