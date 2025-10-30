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

      // Step 1: refresh token
      const res = await baseApi.post("/Accounts/refresh-token", {});

      if (res.data?.statusCode === 200) {
        // Step 2: get user profile
        try {
          const profileRes = await baseApi.get("/Accounts/UserProfile", {
            validateStatus: () => true, // important: don't throw on 400
          });



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

          setUser(null);
          setIsAuthenticated(false);
        }

        return true;
      }

      setUser(null);
      setIsAuthenticated(false);
      return false;
    } catch (err) {

      setUser(null);
      setIsAuthenticated(false);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Login
  const login = async (email, password) => {


    const res = await baseApi.post("/Accounts/login", { email, password });



    if (res.data?.data) {
      setUser(res.data.data);
      setIsAuthenticated(true);
      localStorage.setItem("user", JSON.stringify(res.data.data));
    }

    return res.data;
  };

  // Logout
  const logout = async () => {
    try {
      // attempt to invalidate refresh cookie on server
      await baseApi.post("/Accounts/logout", {}, { validateStatus: () => true });
    } catch (_) {
      // ignore network errors
    } finally {
      try {
        // optional fallback if API exposes revoke endpoint instead
        await baseApi.post("/Accounts/revoke-token", {}, { validateStatus: () => true });
      } catch (_) {
        // ignore
      }
      setIsAuthenticated(false);
      setUser(null);
      localStorage.removeItem("user");
    }
  };

  // Run once on mount
  useEffect(() => {

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
