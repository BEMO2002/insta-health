import axios from "axios";

// Centralized Axios instance for the app
const baseApi = axios.create({
  baseURL: "https://instahealthy.runasp.net/api",
  headers: {
    Accept: "application/json",
  },
  withCredentials: true,
});

export default baseApi;
