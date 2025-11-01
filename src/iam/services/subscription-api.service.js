import http from "../../shared/services/http-common";
import axios from "axios";
import { Subscription } from "../model/subscription.entity";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const RESOURCE = "subscriptions";

const publicHttp = axios.create({
    baseURL: API_BASE_URL,
    headers: { 'Content-Type': 'application/json' }
});

export class SubscriptionApiService {
  async getAll() {
    const response = await http.get(RESOURCE);
    return response.data.map(item => new Subscription(item));
  }

  async getActive() {
    const response = await publicHttp.get(`${RESOURCE}/active`);
    return response.data.map(item => new Subscription(item));
  }

  async getById(id) {
    const response = await http.get(`${RESOURCE}/${id}`);
    return new Subscription(response.data);
  }

  async create(subscriptionData) {
    const response = await http.post(RESOURCE, subscriptionData);
    return new Subscription(response.data);
  }

  async update(id, subscriptionData) {
    const response = await http.put(`${RESOURCE}/${id}`, subscriptionData);
    return new Subscription(response.data);
  }

  async delete(id) {
    const response = await http.delete(`${RESOURCE}/${id}`);
    return response.data;
  }
}