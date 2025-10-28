import http from "../../shared/services/http-common.js";

export class SubscriptionsApiService {
    getAllSubscriptions() {
        return http.get("/subscriptions").then(response => response.data);
    }

    getSubscriptionById(id) {
        return http.get(`/subscriptions/${id}`).then(response => response.data);
    }

    createSubscription(subscriptionData) {
        return http.post("/subscriptions", subscriptionData).then(response => response.data);
    }

    updateSubscription(id, subscriptionData) {
        return http.put(`/subscriptions/${id}`, subscriptionData).then(response => response.data);
    }

    deleteSubscription(id) {
        return http.delete(`/subscriptions/${id}`).then(response => response.data);
    }
}