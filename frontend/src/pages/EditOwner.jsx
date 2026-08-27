import React, { useState, useEffect } from "react";
import styles from "./signup.module.css";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import apiClient from "../api/apiClient";

const EditOwner = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ownerDetails, setOwnerDetails] = useState({
    productOwnerName: "",
    productOwnerEmail: "",
    productOwnerNumber: "",
    productOwnerAddress: "",
  });

  useEffect(() => {
    if (id) {
      apiClient
        .get(`/api/v1/sellers/${id}`)
        .then((res) => {
          const data = res.data?.data || res.data;
          if (data) {
            setOwnerDetails((prev) => ({
              ...prev,
              ...data,
            }));
          }
        })
        .catch((err) => {
          console.error("Error fetching owner details:", err);
          toast.error("Failed to fetch owner details.");
        });
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setOwnerDetails({
      ...ownerDetails,
      [name]: value,
    });
  };

  const updateOwner = (e) => {
    e.preventDefault();
    apiClient
      .put(`/api/v1/sellers/${id}`, ownerDetails)
      .then(() => {
        toast.success("Product owner updated successfully!");
        navigate("/admindashboard", { replace: true });
      })
      .catch((err) => {
        console.error("Error updating product owner:", err);
        toast.error("Something went wrong");
      });
  };

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <h1>Edit Product Owner #{id}</h1>
        <form onSubmit={updateOwner}>
          <div className={styles.inputGroup}>
            <label htmlFor="productOwnerName">Name</label>
            <input
              type="text"
              id="productOwnerName"
              name="productOwnerName"
              placeholder="Enter name"
              value={ownerDetails.productOwnerName}
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
              value={ownerDetails.productOwnerEmail}
              onChange={handleChange}
              required
              disabled
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
              value={ownerDetails.productOwnerNumber}
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

export default EditOwner;
