/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useEffect, useState } from "react";
import baseApi from "../api/baseApi";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check auth on page refresh
  // Check auth on page refresh
  const checkAuth = async () => {
    try {
      console.log("🔄 Checking auth...");

      // Step 1: refresh token
      const res = await baseApi.post("/Accounts/refresh-token", {});
      console.log("refresh-token response:", res.data);

      if (res.data?.statusCode === 200) {
        // Step 2: get user profile
        try {
          const profileRes = await baseApi.get("/Accounts/UserProfile", {
            validateStatus: () => true, // important: don't throw on 400
          });

          console.log("UserProfile raw response:", profileRes);

          const profileData = profileRes.data;

          if (profileData?.data) {
            setUser(profileData.data);
            setIsAuthenticated(true);
            localStorage.setItem("user", JSON.stringify(profileData.data));
          } else {
            console.warn("⚠️ No user data in profile response");
            setUser(null);
            setIsAuthenticated(false);
          }
        } catch (profileErr) {
          console.error("Error fetching profile:", profileErr);
          setUser(null);
          setIsAuthenticated(false);
        }

        return true;
      }

      setUser(null);
      setIsAuthenticated(false);
      return false;
    } catch (err) {
      console.error("checkAuth error:", err);
      setUser(null);
      setIsAuthenticated(false);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Login
  const login = async (email, password) => {
    console.log("🚀 Logging in with:", email);

    const res = await baseApi.post("/Accounts/login", { email, password });

    console.log("Login response:", res.data);

    if (res.data?.data) {
      setUser(res.data.data);
      setIsAuthenticated(true);
      localStorage.setItem("user", JSON.stringify(res.data.data));
    }

    return res.data;
  };

  // Logout
  const logout = () => {
    console.log("Logging out...");
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem("user");
  };

  // Run once on mount
  useEffect(() => {
    console.log("useEffect init - current user:", localStorage.getItem("user"));
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, login, logout, checkAuth, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};
