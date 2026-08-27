import React, { createContext, useContext, useState, useEffect } from "react";
import apiClient from "../api/apiClient";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });

  const [role, setRole] = useState(() => {
    return localStorage.getItem("role") || user?.role || "USER";
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const token = localStorage.getItem("token") || localStorage.getItem("accessToken");
    return Boolean(token);
  });

  // Login handler
  const login = async (email, password) => {
    try {
      const res = await apiClient.post("/api/v1/auth/login", { email, password });
      const data = res.data?.data || res.data;

      const token = data.accessToken || data.token;
      const userObj = data.user || {
        id: data.id || data.userId,
        email: data.email || email,
        fullName: data.name || data.fullName || email.split("@")[0],
        role: data.role || "USER",
      };

      if (token) {
        localStorage.setItem("token", token);
        localStorage.setItem("accessToken", token);
      }
      if (data.refreshToken) {
        localStorage.setItem("refreshToken", data.refreshToken);
      }

      localStorage.setItem("user", JSON.stringify(userObj));
      localStorage.setItem("userID", userObj.id || "");
      localStorage.setItem("role", userObj.role || "USER");

      setUser(userObj);
      setRole(userObj.role || "USER");
      setIsAuthenticated(true);

      return { success: true, user: userObj };
    } catch (err) {
      console.error("Login error:", err);
      return {
        success: false,
        message: err.response?.data?.message || err.response?.data?.data || "Invalid credentials. Please try again.",
      };
    }
  };

  // Customer registration handler
  const registerCustomer = async (fullName, email, password, phone = "") => {
    try {
      const res = await apiClient.post("/api/v1/auth/register", {
        name: fullName,
        email: email,
        password: password,
        phoneNumber: phone,
      });
      return { success: true, data: res.data };
    } catch (err) {
      console.error("Registration error:", err);
      return {
        success: false,
        message: err.response?.data?.message || err.response?.data?.data || "Registration failed.",
      };
    }
  };

  // Seller registration handler
  const registerSeller = async (fullName, email, password, phone = "9876543210") => {
    try {
      const parsedNumber = parseInt(String(phone).replace(/\D/g, ""), 10) || 9876543210;
      const res = await apiClient.post("/api/v1/auth/seller/register", {
        productOwnerName: fullName,
        productOwnerEmail: email,
        productOwnerPassword: password,
        productOwnerNumber: parsedNumber,
      });
      return { success: true, data: res.data };
    } catch (err) {
      console.error("Seller registration error:", err);
      return {
        success: false,
        message: err.response?.data?.message || err.response?.data?.data || "Seller registration failed.",
      };
    }
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    localStorage.removeItem("userID");
    localStorage.removeItem("role");
    sessionStorage.clear();

    setUser(null);
    setRole("USER");
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated,
        login,
        registerCustomer,
        registerSeller,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
