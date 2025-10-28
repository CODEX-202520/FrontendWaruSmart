import {useAuthenticationStore} from "./authentication.store.js";

/**
 * Guard to check if the user has the required role
 *
 * @summary
 * This guard checks if the user has the required role to access a specific route.
 * If the user doesn't have the required role, they are redirected to an unauthorized page or the home page.
 * @param to - The route the user is navigating to
 * @param from - The route the user is navigating from
 * @param next - The function to navigate to the next route
 * @param requiredRole - The role required to access the route
 * @returns {*}
 */
export const authorizationGuard = (to, from, next, requiredRole) => {
    const authenticationStore = useAuthenticationStore();
    const userRole = authenticationStore.currentUserRole;

    if (!requiredRole) {
        // No specific role required, allow access
        return next();
    }

    if (userRole === requiredRole) {
        return next();
    } else {
        // User doesn't have the required role
        console.warn(`Access denied. Required role: ${requiredRole}, User role: ${userRole}`);
        return next({ name: 'control-panel' }); // Redirect to control panel or a "forbidden" page
    }
};

/**
 * Check if user has admin role
 * @returns {boolean}
 */
export const isAdministrator = () => {
    const authenticationStore = useAuthenticationStore();
    return authenticationStore.isAdmin;
};
