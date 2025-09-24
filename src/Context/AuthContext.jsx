/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useEffect } from "react";
import baseApi from "../api/baseApi";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(
    localStorage.getItem("token") || sessionStorage.getItem("token") || null
  );

  useEffect(() => {
    const userData =
      localStorage.getItem("user") || sessionStorage.getItem("user");
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch {
        setUser(null);
      }
    } else {
      setUser(null);
    }
    setIsAuthenticated(Boolean(userData || accessToken));
  }, [accessToken]);

  // Helper: persist token consistently
  const persistToken = (token) => {
    if (!token) return;
    localStorage.setItem("token", token);
    sessionStorage.setItem("token", token);
    setAccessToken(token);
    setIsAuthenticated(true);
  };

  // Public helper for consumers that need the access token
  const getAccessToken = () =>
    localStorage.getItem("token") || sessionStorage.getItem("token") || null;

  // Refresh token using cookies (withCredentials=true on baseApi)
  const refreshAccessToken = async () => {
    try {
      const res = await baseApi.post("/Accounts/refresh-token", {});
      // Try multiple common shapes for token location
      const data = res?.data?.data || res?.data || {};
      const token =
        data?.accessToken || data?.token || data?.jwt || data?.access_token;
      if (token) {
        persistToken(token);
        // Optionally update user if backend returns it alongside the token
        if (data?.user) {
          setUser(data.user);
          localStorage.setItem("user", JSON.stringify(data.user));
          sessionStorage.setItem("user", JSON.stringify(data.user));
        }
        return token;
      }
      throw new Error("No token in refresh response");
    } catch {
      // Invalid or expired refresh -> force logout
      logout();
      return null;
    }
  };

  const login = async (email, password) => {
    const res = await baseApi.post(
      "/Accounts/login",
      { email, password },
      { withCredentials: true }
    );
    if (res.data) {
      const payload = res.data.data || {};
      // Persist user if present
      if (payload?.user) {
        localStorage.setItem("user", JSON.stringify(payload.user));
        sessionStorage.setItem("user", JSON.stringify(payload.user));
        setUser(payload.user);
      } else if (
        payload &&
        Object.keys(payload).length &&
        !payload.accessToken
      ) {
        // Some backends return user directly as data
        localStorage.setItem("user", JSON.stringify(payload));
        sessionStorage.setItem("user", JSON.stringify(payload));
        setUser(payload);
      }
      // Persist token if the login returns it
      const token =
        payload?.accessToken || payload?.token || payload?.jwt || null;
      if (token) persistToken(token);
      setIsAuthenticated(true);
    }
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    setIsAuthenticated(false);
    setUser(null);
    setAccessToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        accessToken,
        getAccessToken,
        refreshAccessToken,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
