import profileApiService from '../service/profile-api.service';

export async function profileGuard(to) {
    // Skip profile check for routes that don't require it
    if (to.meta.skipProfileCheck) {
        return true;
    }

    // Get userId from localStorage
    const userId = localStorage.getItem('userId');
    if (!userId) {
        return { name: 'sign-in' };
    }

    try {
        // Check if user has a profile
        const hasProfile = await profileApiService.hasUserProfile();
        
        if (!hasProfile && to.name !== 'user-profile-create') {
            return { name: 'user-profile-create' };
        }

        // If user has profile and tries to access profile creation, redirect to control panel
        if (hasProfile && to.name === 'user-profile-create') {
            return { name: 'control-panel' };
        }

        return true;
    } catch (error) {
        console.error('Error in profile guard:', error);
        return { name: 'sign-in' };
    }
}