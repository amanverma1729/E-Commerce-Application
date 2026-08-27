import React, { useState } from "react";
import styles from "./signup.module.css";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import apiClient from "../api/apiClient";

const SignupProductOwner = () => {
  const [signupuser, setSignupuser] = useState({
    productOwnerName: "",
    productOwnerEmail: "",
    productOwnerPassword: "",
    productOwnerNumber: "",
    agreement: false,
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSignupuser({
      ...signupuser,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const signupFormSubmit = async (e) => {
    e.preventDefault();

    if (!signupuser.agreement) {
      toast.error("Please accept the agreement");
      return;
    }

    const signupData = {
      productOwnerName: signupuser.productOwnerName.trim(),
      productOwnerEmail: signupuser.productOwnerEmail.trim().toLowerCase(),
      productOwnerPassword: signupuser.productOwnerPassword.trim(),
      productOwnerNumber: Number(signupuser.productOwnerNumber),
    };

    try {
      const response = await apiClient.post("/api/v1/auth/seller/register", signupData);
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
        sessionStorage.setItem("userType", "PRODUCT_OWNER");
        sessionStorage.setItem("productOwnerId", id);
        localStorage.setItem("userType", "PRODUCT_OWNER");
        localStorage.setItem("productOwnerId", id);
      }

      toast.success("Seller registration successful! Welcome to FLASH.");
      setSignupuser({
        productOwnerName: "",
        productOwnerEmail: "",
        productOwnerPassword: "",
        productOwnerNumber: "",
        agreement: false,
      });
      navigate("/productlist");
    } catch (error) {
      console.error("Error during seller signup:", error);
      const msg = error.response?.data?.message || "Signup failed";
      toast.error("Signup failed: " + msg);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <h1>Product Owner Signup</h1>
        <form onSubmit={signupFormSubmit}>
          <div className={styles.inputGroup}>
            <label htmlFor="productOwnerName">Name</label>
            <input
              type="text"
              id="productOwnerName"
              name="productOwnerName"
              placeholder="Enter name"
              value={signupuser.productOwnerName}
              onChange={handleChange}
              required
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="productOwnerEmail">Email</label>
            <input
              type="email"
              id="productOwnerEmail"
              name="productOwnerEmail"
              placeholder="Enter email"
              value={signupuser.productOwnerEmail}
              onChange={handleChange}
              required
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="productOwnerPassword">Password</label>
            <input
              type="password"
              id="productOwnerPassword"
              name="productOwnerPassword"
              placeholder="Enter password"
              value={signupuser.productOwnerPassword}
              onChange={handleChange}
              required
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="productOwnerNumber">Phone Number</label>
            <input
              type="tel"
              id="productOwnerNumber"
              name="productOwnerNumber"
              placeholder="Enter phone number"
              minLength={10}
              maxLength={10}
              value={signupuser.productOwnerNumber}
              onChange={handleChange}
              required
            />
          </div>
          <div className={styles.checkboxGroup}>
            <input
              type="checkbox"
              name="agreement"
              onChange={handleChange}
              checked={signupuser.agreement}
            />
            <span>Agree & Continue</span>
          </div>
          <button type="submit" className={styles.submitButton}>
            Signup
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignupProductOwner;
