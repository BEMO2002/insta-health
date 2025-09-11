/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useEffect } from "react";
import baseApi from "../api/baseApi";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  const normalizeToken = (rawToken) => {
    if (!rawToken) return "";
    return rawToken.startsWith("Bearer ") ? rawToken.slice(7) : rawToken;
  };

  useEffect(() => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    const userData =
      localStorage.getItem("user") || sessionStorage.getItem("user");

    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsAuthenticated(true);
        const normalized = normalizeToken(token);
        if (normalized) {
          baseApi.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${normalized}`;
        }
      } catch (error) {
        console.error("Invalid user data in storage:", error);
        setUser(null);
        setIsAuthenticated(false);
      }
    } else if (token && !userData) {
      // If token exists but no user payload, still mark authenticated
      setIsAuthenticated(true);
      const normalized = normalizeToken(token);
      if (normalized) {
        baseApi.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${normalized}`;
      }
    }
  }, []);

  const login = (token, userData, rememberMe) => {
    // Persist in both storages; mark preferred persistence
    const normalized = normalizeToken(token);
    localStorage.setItem("token", normalized);
    localStorage.setItem("user", JSON.stringify(userData || {}));
    sessionStorage.setItem("token", normalized);
    sessionStorage.setItem("user", JSON.stringify(userData || {}));
    // track user's choice for potential future logic
    const persistChoice = rememberMe ? "local" : "session";
    localStorage.setItem("auth_persist", persistChoice);
    sessionStorage.setItem("auth_persist", persistChoice);
    // Set header for subsequent API calls
    baseApi.defaults.headers.common["Authorization"] = `Bearer ${normalized}`;
    setIsAuthenticated(true);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
