import axios from "axios";

// Centralized Axios instance for the app
const baseApi = axios.create({
  baseURL: "https://instahealthy.runasp.net/api",
  headers: {
    Accept: "application/json",
  },
  withCredentials: true, // important for sending cookies
});

// Response interceptor to auto refresh on 401 and retry original request
baseApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error?.config || {};

    if (error?.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // Call refresh endpoint - cookies are sent automatically
        await baseApi.post("/Accounts/refresh-token", {});
        // Retry the original request
        return baseApi(originalRequest);
      } catch (refreshError) {
        // If refresh fails, propagate the original error
        console.error("Session refresh failed:", refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default baseApi;
