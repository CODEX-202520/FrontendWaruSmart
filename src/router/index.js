import { createRouter, createWebHistory } from 'vue-router';


import CropsStatisticsComponent from "../analytics/pages/analytics-crops.component.vue";
import ControlPanelPageComponent from "../public/pages/control-panel-page.component.vue";
import CropInformationManagementComponent from "../crops/pages/crop-information-management.component.vue";
import CropListAndRegistrationManagementComponent from "../crops/pages/crop-list-and-registration-management.component.vue";
import HistoryTableComponent from "../crops/components/history-table.component.vue";
import ForumManagementComponent from "../forum/pages/forum-management.component.vue";
import UserProfileEditPageComponent from "../profiles/pages/user-profile-edit-page.component.vue";
import UserProfileCreatePageComponent from "../profiles/pages/user-profile-create-page.component.vue";
import PageNotFoundComponent from "../public/pages/page-not-found.component.vue";
import SignUpComponent from "../iam/pages/sign-up.component.vue";
import SignInComponent from "../iam/pages/sign-in.component.vue";
import {authenticationGuard} from "../iam/services/authentication.guard.js";
import {authorizationGuard} from "../iam/services/authorization.guard.js";
import {profileGuard} from "../profiles/guards/profile.guard.js";


const routes = [
    { path: '/', redirect: '/sign-in', component: SignInComponent, meta: { title: 'Sign In', skipProfileCheck: true } },
    { path: '/sign-in', name: 'sign-in', component: SignInComponent, meta: { title: 'Sign In', skipProfileCheck: true } },
    { path: '/sign-up', name: 'sign-up', component: SignUpComponent, meta: { title: 'Sign Up', skipProfileCheck: true } },
    { path: '/user-profile-edit/:username', name: 'user-profile-edit', component: UserProfileEditPageComponent, meta: { title: 'Edit Profile' } },
    { 
        path: '/user-profile-create', 
        name: 'user-profile-create', 
        component: UserProfileCreatePageComponent, 
        meta: { 
            title: 'Create Profile', 
            skipProfileCheck: true,
            requiresNoProfile: true 
        } 
    },
    { path: '/sowing-statistics-reports:tab?', name: 'sowing-statistics-reports', component: CropsStatisticsComponent, meta: { title: 'Sowing Statistics' } },
    { path: '/control-panel', name: 'control-panel', component: ControlPanelPageComponent, meta: { title: 'Control Panel' } },
    { path: '/crop-list/registration', name: 'crop-list-registration', component: CropListAndRegistrationManagementComponent, meta: { title: 'Crop Registration' } },
    { path: '/crop/:cropId/sowing/:sowingId/:tab?', name: 'crop-information', component: CropInformationManagementComponent, meta: { title: 'Crop Information' } },
    { path: '/crop-history', name: 'crop-history', component: HistoryTableComponent, meta: { title: 'Crop History' } },
    { path: '/consultation-forum', name: 'consultation-forum', component: ForumManagementComponent, meta: { title: 'Consultation Forum' } },
    { path: '/:pathMatch(.*)*', name: 'page-not-found', component: PageNotFoundComponent, meta: { title: 'Page Not Found' } }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

router.beforeEach(async (to, from, next) => {
    let baseTitle = 'WaruSmart';
    document.title = `${baseTitle} | ${to.meta['title']}`;

    // Skip guards for public routes
    if (to.name === 'sign-in' || to.name === 'sign-up') {
        next();
        return;
    }

    // Check authentication first
    const authCheck = new Promise(resolve => {
        authenticationGuard(to, from, resolve);
    });

    const authResult = await authCheck;
    if (authResult && authResult.name === 'sign-in') {
        next(authResult);
        return;
    }

    // Check profile if authenticated
    if (to.name === 'control-panel' || !to.meta.skipProfileCheck) {
        const profileCheck = await profileGuard(to);
        if (profileCheck !== true) {
            next(profileCheck);
            return;
        }
    }

    // Check authorization if needed
    if (to.meta.requiresRole) {
        const authzCheck = new Promise(resolve => {
            authorizationGuard(to, from, resolve, to.meta.requiresRole);
        });
        
        const authzResult = await authzCheck;
        if (authzResult) {
            next(authzResult);
            return;
        }
    }

    next();
});
export default router;