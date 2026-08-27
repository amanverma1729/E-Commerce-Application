import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiPlusSquare, FiUser, FiMail, FiLock, FiPhone, FiArrowRight } from "react-icons/fi";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import styles from "./loginpage.module.css";

const SellerRegisterPage = () => {
  const navigate = useNavigate();
  const { registerSeller } = useAuth();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.password || !formData.phone) {
      toast.error("Please fill in all merchant registration fields.");
      return;
    }

    setLoading(true);
    const result = await registerSeller(
      formData.fullName,
      formData.email,
      formData.password,
      formData.phone
    );
    setLoading(false);

    if (result.success) {
      toast.success("Seller Account Registered Successfully! Please Sign In.");
      navigate("/login");
    } else {
      toast.error(result.message || "Merchant registration failed.");
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.card}>
        <Link to="/" style={{ display: "inline-block", marginBottom: "12px" }}>
          <img src="/flash-logo.png" alt="FLASH Logo" style={{ height: "65px", objectFit: "contain", mixBlendMode: "multiply" }} />
        </Link>
        <h1 className={styles.title}>Become a FLASH Merchant</h1>
        <p className={styles.subtitle}>Sell your products to millions of buyers nationwide</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label>Contact Full Name *</label>
            <div className={styles.inputWrapper}>
              <FiUser className={styles.inputIcon} />
              <input
                type="text"
                required
                placeholder="Manager Name"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label>Business Email Address *</label>
            <div className={styles.inputWrapper}>
              <FiMail className={styles.inputIcon} />
              <input
                type="email"
                required
                placeholder="seller@business.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label>Phone Number *</label>
            <div className={styles.inputWrapper}>
              <FiPhone className={styles.inputIcon} />
              <input
                type="tel"
                required
                placeholder="9876543210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label>Account Password *</label>
            <div className={styles.inputWrapper}>
              <FiLock className={styles.inputIcon} />
              <input
                type="password"
                required
                placeholder="Minimum 6 characters"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className={styles.submitBtn}>
            {loading ? "Registering Merchant..." : "Register Merchant Account"} <FiArrowRight />
          </button>
        </form>

        <div className={styles.footerRow}>
          <p>Already registered as a merchant?</p>
          <Link to="/login" className={styles.linkText}>Sign In</Link>
        </div>
      </div>
    </div>
  );
};

export default SellerRegisterPage;
