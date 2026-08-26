import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "./userprofile.module.css";
import { useNavigate } from "react-router-dom";
import {
  FiUser,
  FiMail,
  FiMapPin,
  FiEdit3,
  FiShoppingCart,
  FiPackage,
  FiShield,
  FiClock,
} from "react-icons/fi";

const UserProfile = () => {
  const userID = sessionStorage.getItem("userID");
  const navigate = useNavigate();
  const [userDetails, setUserDetails] = useState({
    name: "",
    email: "",
    address: "",
    phone: "",
  });

  useEffect(() => {
    if (userID) {
      axios
        .get(`http://localhost:9090/users/id/${userID}`)
        .then((res) => {
          setUserDetails(res.data);
        })
        .catch((err) => {
          console.error("Error fetching user details:", err);
        });
    }
  }, [userID]);

  return (
    <div className={styles.profileWrapper}>
      <div className={styles.container}>
        {/* Banner Header */}
        <div className={styles.bannerHeader}>
          <div className={styles.avatarGlow}>
            <FiUser className={styles.avatarIcon} />
          </div>
          <div className={styles.headerInfo}>
            <span className={styles.roleTag}>CUSTOMER ACCOUNT</span>
            <h1 className={styles.userName}>{userDetails.name || "Customer Profile"}</h1>
            <div className={styles.metaRow}>
              <span className={styles.metaItem}>
                <FiMail /> {userDetails.email || "No email"}
              </span>
              <span className={styles.metaItem}>
                <FiMapPin /> {userDetails.address || "No primary address registered"}
              </span>
            </div>
          </div>

          <button className={styles.editBtn} onClick={() => navigate("/edituser")}>
            <FiEdit3 /> Edit Profile
          </button>
        </div>

        {/* Action Quick Hub */}
        <div className={styles.quickGrid}>
          <div
            className={styles.actionCard}
            onClick={() => navigate(`/cartpage/${userID}`)}
          >
            <div className={styles.cardIconWrapper}>
              <FiShoppingCart />
            </div>
            <div className={styles.cardText}>
              <h3>My Cart</h3>
              <p>View saved items & proceed to checkout</p>
            </div>
          </div>

          <div
            className={styles.actionCard}
            onClick={() => navigate(`/orderpage/${userID}`)}
          >
            <div className={styles.cardIconWrapperAccent}>
              <FiPackage />
            </div>
            <div className={styles.cardText}>
              <h3>My Orders</h3>
              <p>Track live deliveries & view past purchases</p>
            </div>
          </div>

          <div
            className={styles.actionCard}
            onClick={() => navigate("/edituser")}
          >
            <div className={styles.cardIconWrapperCyan}>
              <FiShield />
            </div>
            <div className={styles.cardText}>
              <h3>Account Security</h3>
              <p>Manage password & delivery information</p>
            </div>
          </div>
        </div>

        {/* User Details Details Card */}
        <div className={styles.detailsCard}>
          <h2 className={styles.sectionTitle}>Account Details Overview</h2>

          <div className={styles.infoGrid}>
            <div className={styles.infoBox}>
              <label>Full Name</label>
              <p>{userDetails.name || "N/A"}</p>
            </div>
            <div className={styles.infoBox}>
              <label>Email Address</label>
              <p>{userDetails.email || "N/A"}</p>
            </div>
            <div className={styles.infoBox}>
              <label>Phone Contact</label>
              <p>{userDetails.phone || "Not Provided"}</p>
            </div>
            <div className={styles.infoBox}>
              <label>Default Shipping Address</label>
              <p>{userDetails.address || "Not Provided"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;

