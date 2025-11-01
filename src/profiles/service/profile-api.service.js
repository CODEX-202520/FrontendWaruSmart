import http from "../../shared/services/http-common.js";

export class ProfileApiService {
    create(profileData) {
        console.log("Creating profile with data:", profileData);
        return http.post('/profiles', profileData);
    }


    update(id, model) {
        return http.put(`/profiles/${id}`, model);
    }

    getProfileById(id){
        return http.get(`/profiles/${id}`)
    }

    async getUserProfileById(userId) {
        try {
            const response = await http.get(`/profiles/${userId}/user`);
            return { data: response.data, isNewUser: false };
        } catch (error) {
            // Si el error es 404, significa que el usuario no tiene perfil aún
            if (error.response && error.response.status === 404) {
                return { data: null, isNewUser: true };
            }
            throw error;
        }
    }

    async hasUserProfile() {
        const userId = localStorage.getItem('userId');
        if (!userId) return false;
        
        try {
            const response = await this.getUserProfileById(userId);
            // If we get data back and it's not marked as a new user, then the profile exists
            return response.data !== null && !response.isNewUser;
        } catch (error) {
            // Log the error but don't throw it - return false to trigger profile creation
            console.error('Error checking user profile:', error);
            return false;
        }
    }

    updateProfile(profileId, model) {
        return http.put(`/profiles/${profileId}`, model);
    }
}
export default new ProfileApiService();