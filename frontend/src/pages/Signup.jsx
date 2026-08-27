import React, { useState } from "react";
import styles from "./signup.module.css";
import toast from "react-hot-toast";
import { useNavigate, Link } from "react-router-dom";
import {
  FiUser,
  FiMail,
  FiLock,
  FiPhone,
  FiMapPin,
  FiUserPlus,
  FiZap,
} from "react-icons/fi";
import apiClient from "../api/apiClient";

const Signup = () => {
  const [signupuser, setSignupuser] = useState({
    name: "",
    email: "",
    password: "",
    phoneNumber: "",
    address: "",
    agreement: false,
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSignupuser({
      ...signupuser,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const signupFormSubmit = (e) => {
    e.preventDefault();
    if (!signupuser.agreement) {
      toast.error("Please accept the terms and conditions");
      return;
    }

    setLoading(true);
    apiClient
      .post("/api/v1/auth/register", {
        ...signupuser,
        email: signupuser.email.trim().toLowerCase(),
        password: signupuser.password.trim(),
      })
      .then((response) => {
        const data = response.data.data || response.data;
        const { token, accessToken, refreshToken, id } = data;

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
        if (id) {
          sessionStorage.setItem("userType", "USER");
          sessionStorage.setItem("userID", id);
          localStorage.setItem("userType", "USER");
          localStorage.setItem("userID", id);
        }

        toast.success("Account created successfully! Welcome to FLASH.");
        setSignupuser({
          name: "",
          email: "",
          password: "",
          phoneNumber: "",
          address: "",
          agreement: false,
        });
        navigate("/userprofile");
      })
      .catch((err) => {
        console.error("Error:", err.response);
        const msg = err.response?.data?.message || "Something went wrong during registration";
        toast.error(msg);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.formCard}>
        <div className={styles.brandBadge}>
          <FiZap /> FLASH REGISTRATION
        </div>

        <h1 className={styles.title}>Create Account</h1>
        <p className={styles.subtitle}>Join Flash for exclusive deals & instant delivery</p>

        <form onSubmit={signupFormSubmit} className={styles.form}>
          <div className={styles.gridRow}>
            <div className={styles.inputGroup}>
              <label htmlFor="name">
                <FiUser /> Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="John Doe"
                value={signupuser.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="email">
                <FiMail /> Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="john@example.com"
                value={signupuser.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className={styles.gridRow}>
            <div className={styles.inputGroup}>
              <label htmlFor="password">
                <FiLock /> Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="••••••••••••"
                value={signupuser.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="phoneNumber">
                <FiPhone /> Mobile Number
              </label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                placeholder="9876543210"
                minLength={10}
                maxLength={10}
                value={signupuser.phoneNumber}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className={styles.inputGroupFull}>
            <label htmlFor="address">
              <FiMapPin /> Delivery Address
            </label>
            <input
              type="text"
              id="address"
              name="address"
              placeholder="Street, City, Zipcode, State"
              value={signupuser.address}
              onChange={handleChange}
              required
            />
          </div>

          <label className={styles.checkboxGroup}>
            <input
              type="checkbox"
              name="agreement"
              onChange={handleChange}
              checked={signupuser.agreement}
            />
            <span>I agree to the Terms of Service & Privacy Policy</span>
          </label>

          <button type="submit" className={styles.submitButton} disabled={loading}>
            <FiUserPlus /> {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div className={styles.cardFooter}>
          <p>
            Already have an account?{" "}
            <Link to="/login" className={styles.loginLink}>
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
