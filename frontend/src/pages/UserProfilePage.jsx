import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  FiUser, 
  FiMail, 
  FiShield, 
  FiBox, 
  FiHeart, 
  FiPlusSquare, 
  FiLogOut, 
  FiCheckCircle,
  FiZap
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import styles from "./userprofile.module.css";

const UserProfilePage = () => {
  const navigate = useNavigate();
  const { user, role, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.headerCard}>
        <div className={styles.avatarCircle}>
          {user?.fullName ? user.fullName[0].toUpperCase() : "U"}
        </div>
        <div className={styles.headerInfo}>
          <div className={styles.nameRow}>
            <h1 className={styles.userName}>{user?.fullName || "FLASH Customer"}</h1>
            <span className={styles.roleBadge}>{role || "USER"}</span>
          </div>
          <p className={styles.userEmail}>{user?.email || "customer@flash.com"}</p>
        </div>
      </div>

      <div className={styles.grid}>
        {/* Quick Portal Cards */}
        <Link to="/orders" className={styles.portalCard}>
          <div className={styles.cardIcon}>
            <FiBox />
          </div>
          <div className={styles.cardContent}>
            <h3 className={styles.cardTitle}>Order History</h3>
            <p className={styles.cardDesc}>Track, return, or inspect past purchases</p>
          </div>
        </Link>

        <Link to="/wishlist" className={styles.portalCard}>
          <div className={styles.cardIcon} style={{ color: "var(--color-danger)", background: "var(--color-danger-bg)" }}>
            <FiHeart />
          </div>
          <div className={styles.cardContent}>
            <h3 className={styles.cardTitle}>Saved Wishlist</h3>
            <p className={styles.cardDesc}>View your bookmarked products and deals</p>
          </div>
        </Link>

        {role === "SELLER" && (
          <Link to="/seller/dashboard" className={styles.portalCard}>
            <div className={styles.cardIcon} style={{ color: "var(--color-success)", background: "var(--color-success-bg)" }}>
              <FiPlusSquare />
            </div>
            <div className={styles.cardContent}>
              <h3 className={styles.cardTitle}>Seller Studio</h3>
              <p className={styles.cardDesc}>Manage listings, stock, and inventory</p>
            </div>
          </Link>
        )}

        {role === "ADMIN" && (
          <Link to="/admin/dashboard" className={styles.portalCard}>
            <div className={styles.cardIcon} style={{ color: "#7c3aed", background: "#f3e8ff" }}>
              <FiShield />
            </div>
            <div className={styles.cardContent}>
              <h3 className={styles.cardTitle}>Admin Moderation</h3>
              <p className={styles.cardDesc}>Review seller registrations and product approvals</p>
            </div>
          </Link>
        )}
      </div>

      {/* Account Info Details */}
      <div className={styles.infoCard}>
        <h2 className={styles.secTitle}>Account Information</h2>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>Account ID</span>
          <span className={styles.infoValue}>#{user?.id || "N/A"}</span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>Email Status</span>
          <span className={styles.verifiedText}><FiCheckCircle /> Verified Customer</span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>Security Access</span>
          <span className={styles.infoValue}>JWT Token Auth Enabled</span>
        </div>

        <button onClick={handleLogout} className={styles.logoutBtn}>
          <FiLogOut /> Sign Out of Account
        </button>
      </div>
    </div>
  );
};

export default UserProfilePage;
