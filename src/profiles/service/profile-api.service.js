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
            return response;
        } catch (error) {
            // Si el error es 404, significa que el usuario no tiene perfil aún
            if (error.response && error.response.status === 404) {
                return { data: null, isNewUser: true };
            }
            throw error;
        }
    }

    updateProfile(profileId, model) {
        return http.put(`/profiles/${profileId}`, model);
    }
}
export default new ProfileApiService();