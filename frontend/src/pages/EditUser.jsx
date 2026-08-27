import React, { useState, useEffect } from "react";
import styles from "./signup.module.css";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import apiClient from "../api/apiClient";

const EditUser = () => {
  const userID = sessionStorage.getItem("userID") || localStorage.getItem("userID");
  const navigate = useNavigate();
  const [userDetails, setUserDetails] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    address: "",
  });

  useEffect(() => {
    if (userID) {
      apiClient
        .get(`/api/v1/users/${userID}`)
        .then((res) => {
          const data = res.data?.data || res.data;
          setUserDetails(data);
        })
        .catch((err) => {
          console.error("Error fetching user details:", err);
        });
    }
  }, [userID]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserDetails({
      ...userDetails,
      [name]: value,
    });
  };

  const updateUser = (e) => {
    e.preventDefault();
    apiClient
      .put(`/api/v1/users/${userID}`, userDetails)
      .then(() => {
        toast.success("Profile updated successfully");
        navigate("/userprofile", { replace: true });
      })
      .catch((err) => {
        console.error("Error updating profile:", err);
        toast.error("Something went wrong");
      });
  };

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <h1>Edit Profile</h1>
        <form onSubmit={updateUser}>
          <div className={styles.inputGroup}>
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="Enter name"
              value={userDetails.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter email"
              value={userDetails.email}
              onChange={handleChange}
              required
              disabled
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="phoneNumber">Phone Number</label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              placeholder="Enter phone number"
              minLength={10}
              maxLength={10}
              value={userDetails.phoneNumber || userDetails.phone || ""}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="address">Address</label>
            <input
              type="text"
              id="address"
              name="address"
              placeholder="Enter address"
              value={userDetails.address}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className={styles.submitButton}>
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditUser;
