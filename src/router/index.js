import { createRouter, createWebHistory } from 'vue-router';


import CropsStatisticsComponent from "../analytics/pages/analytics-crops.component.vue";
import ControlPanelPageComponent from "../public/pages/control-panel-page.component.vue";
import CropInformationManagementComponent from "../crops/pages/crop-information-management.component.vue";
import CropListAndRegistrationManagementComponent from "../crops/pages/crop-list-and-registration-management.component.vue";
import HistoryTableComponent from "../crops/components/history-table.component.vue";
import ForumManagementComponent from "../forum/pages/forum-management.component.vue";
import MembershipSelectorComponent  from "../profiles/pages/membership-selector.component.vue";
import UserProfileEditPageComponent from "../profiles/pages/user-profile-edit-page.component.vue";
import UserProfileCreatePageComponent from "../profiles/pages/user-profile-create-page.component.vue";
import PageNotFoundComponent from "../public/pages/page-not-found.component.vue";
import SignUpComponent from "../iam/pages/sign-up.component.vue";
import SignInComponent from "../iam/pages/sign-in.component.vue";
import {authenticationGuard} from "../iam/services/authentication.guard.js";
import {authorizationGuard} from "../iam/services/authorization.guard.js";


const routes = [
    { path: '/', redirect: '/sign-in', component: SignInComponent, meta: { title: 'Sign In' } },
    { path: '/sign-in', name: 'sign-in', component: SignInComponent, meta: { title: 'Sign In' } },
    { path: '/sign-up', name: 'sign-up', component: SignUpComponent, meta: { title: 'Sign Up' } },
    { path: '/user-profile-edit/:username', name: 'user-profile-edit', component: UserProfileEditPageComponent, meta: { title: 'Edit Profile' } },
    { path: '/user-profile-create', name: 'user-profile-create', component: UserProfileCreatePageComponent, meta: { title: 'Create Profile' } },
    { path: '/membership-selector', name: 'membership-selector', component: MembershipSelectorComponent, meta: { title: 'Membership Selector' } },
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

router.beforeEach((to, from, next) => {
    let baseTitle = 'WaruSmart';
    document.title = `${baseTitle} | ${to.meta['title']}`;
    
    // First check authentication
    authenticationGuard(to, from, (route) => {
        if (route) {
            // If authentication guard returns a route, navigate to it
            next(route);
        } else {
            // Authentication passed, now check authorization if  needed
            if (to.meta.requiresRole) {
                authorizationGuard(to, from, next, to.meta.requiresRole);
            } else {
                next();
            }
        }
    });
});
export default router;