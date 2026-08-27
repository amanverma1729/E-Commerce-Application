import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FiZap, FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight } from "react-icons/fi";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import styles from "./loginpage.module.css";

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || "/";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter email and password.");
      return;
    }

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      toast.success("Welcome back to FLASH!");
      navigate(from, { replace: true });
    } else {
      toast.error(result.message || "Invalid credentials.");
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.card}>
        <Link to="/" style={{ display: "inline-block", marginBottom: "12px" }}>
          <img src="/flash-logo.png" alt="FLASH Logo" style={{ height: "65px", objectFit: "contain", mixBlendMode: "multiply" }} />
        </Link>
        <h1 className={styles.title}>Sign in to FLASH</h1>
        <p className={styles.subtitle}>Enter your account details to access your portal</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label>Email Address</label>
            <div className={styles.inputWrapper}>
              <FiMail className={styles.inputIcon} />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
            {loading ? "Authenticating..." : "Sign In"} <FiArrowRight />
          </button>
        </form>

        <div className={styles.footerRow}>
          <p>Don't have an account?</p>
          <Link to="/register" className={styles.linkText}>Create Customer Account</Link>
        </div>

        <div className={styles.sellerDivider}>
          <span>Want to sell on FLASH?</span>
          <Link to="/seller/register" className={styles.sellerLink}>Register as Seller</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
