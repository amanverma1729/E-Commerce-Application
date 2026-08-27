import React, { useState } from "react";
import styles from "./login.module.css";
import { useNavigate, useLocation, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { FiMail, FiLock, FiLogIn, FiShield, FiUserCheck, FiZap } from "react-icons/fi";
import apiClient from "../api/apiClient";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      };
      const response = await apiClient.post("/api/v1/auth/login", payload);
      const data = response.data.data || response.data;
      const { token, accessToken, refreshToken, type, id, email, role, message } = data;

      const activeToken = accessToken || token;
      if (activeToken) {
        localStorage.setItem("token", activeToken);
        localStorage.setItem("accessToken", activeToken);
        sessionStorage.setItem("token", activeToken);
      }
      if (refreshToken) {
        localStorage.setItem("refreshToken", refreshToken);
        sessionStorage.setItem("refreshToken", refreshToken);
      }

      const normalizedRole = (role || type || "").toUpperCase();

      const fromPath = location.state?.from;

      if (
        normalizedRole.includes("SELLER") ||
        normalizedRole.includes("PRODUCT_OWNER") ||
        normalizedRole.includes("OWNER")
      ) {
        sessionStorage.setItem("userType", "PRODUCT_OWNER");
        sessionStorage.setItem("productOwnerId", id);
        localStorage.setItem("userType", "PRODUCT_OWNER");
        localStorage.setItem("productOwnerId", id);
        toast.success("Welcome back, Seller!");
        navigate(fromPath || "/productlist");
      } else if (
        normalizedRole.includes("USER") ||
        normalizedRole.includes("CUSTOMER") ||
        id
      ) {
        sessionStorage.setItem("userType", "USER");
        sessionStorage.setItem("userID", id);
        localStorage.setItem("userType", "USER");
        localStorage.setItem("userID", id);
        toast.success("Login successful!");
        navigate(fromPath || "/userprofile");
      } else if (normalizedRole.includes("ADMIN")) {
        sessionStorage.setItem("userType", "ADMIN");
        sessionStorage.setItem("adminId", id);
        localStorage.setItem("userType", "ADMIN");
        localStorage.setItem("adminId", id);
        toast.success("Welcome back, Admin!");
        navigate(fromPath || "/admindashboard");
      } else {
        toast.error(message || "Invalid credentials");
      }
    } catch (error) {
      console.error("Login error:", error);
      const errorMessage =
        error.response?.data?.message || "An error occurred during login";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.formCard}>
        <div className={styles.brandBadge}>
          <FiZap /> FLASH AUTH
        </div>

        <h1 className={styles.title}>Welcome Back</h1>
        <p className={styles.subtitle}>Sign in to access your account & orders</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="email">
              <FiMail /> Email Address
            </label>
            <div className={styles.inputWrapper}>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password">
              <FiLock /> Password
            </label>
            <div className={styles.inputWrapper}>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="••••••••••••"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <button type="submit" className={styles.submitButton} disabled={loading}>
            <FiLogIn /> {loading ? "Authenticating..." : "Sign In"}
          </button>
        </form>

        <div className={styles.cardFooter}>
          <p>Don't have an account?</p>
          <div className={styles.signupLinks}>
            <Link to="/signup" className={styles.linkPill}>
              <FiUserCheck /> Customer Signup
            </Link>
            <Link to="/signupproductowner" className={styles.linkPillOwner}>
              <FiShield /> Seller Signup
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
