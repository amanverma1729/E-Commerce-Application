import React, { useState } from "react";
import styles from "./login.module.css";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { FiMail, FiLock, FiLogIn, FiShield, FiUserCheck, FiZap } from "react-icons/fi";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
      const response = await axios.post(
        "http://localhost:9090/auth/login",
        formData,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      const { type, id, message } = response.data;

      if (type === "PRODUCT_OWNER") {
        sessionStorage.setItem("userType", "PRODUCT_OWNER");
        sessionStorage.setItem("productOwnerId", id);
        toast.success("Welcome back, Seller!");
        navigate("/productlist");
      } else if (type === "USER") {
        sessionStorage.setItem("userType", "USER");
        sessionStorage.setItem("userID", id);
        toast.success("Login successful!");
        navigate("/userprofile");
      } else if (type === "ADMIN") {
        sessionStorage.setItem("userType", "ADMIN");
        sessionStorage.setItem("adminId", id);
        toast.success("Welcome back, Admin!");
        navigate("/admindashboard");
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

