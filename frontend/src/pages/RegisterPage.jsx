import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiZap, FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight } from "react-icons/fi";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import styles from "./loginpage.module.css";

const RegisterPage = () => {
  const navigate = useNavigate();
  const { registerCustomer } = useAuth();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.password) {
      toast.error("Please complete all required fields.");
      return;
    }

    setLoading(true);
    const result = await registerCustomer(formData.fullName, formData.email, formData.password);
    setLoading(false);

    if (result.success) {
      toast.success("Account Created Successfully! Please Sign In.");
      navigate("/login");
    } else {
      toast.error(result.message || "Registration failed.");
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.card}>
        <Link to="/" style={{ display: "inline-block", marginBottom: "12px" }}>
          <img src="/flash-logo.png" alt="FLASH Logo" style={{ height: "65px", objectFit: "contain", mixBlendMode: "multiply" }} />
        </Link>
        <h1 className={styles.title}>Join FLASH Today</h1>
        <p className={styles.subtitle}>Create your customer account to start shopping</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label>Full Name</label>
            <div className={styles.inputWrapper}>
              <FiUser className={styles.inputIcon} />
              <input
                type="text"
                required
                placeholder="John Doe"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label>Email Address</label>
            <div className={styles.inputWrapper}>
              <FiMail className={styles.inputIcon} />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label>Password</label>
            <div className={styles.inputWrapper}>
              <FiLock className={styles.inputIcon} />
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="Minimum 6 characters"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={styles.eyeBtn}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className={styles.submitBtn}>
            {loading ? "Creating Account..." : "Create Account"} <FiArrowRight />
          </button>
        </form>

        <div className={styles.footerRow}>
          <p>Already have an account?</p>
          <Link to="/login" className={styles.linkText}>Sign In</Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
