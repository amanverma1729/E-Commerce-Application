import React from "react";
import { Link } from "react-router-dom";
import { 
  FiZap, 
  FiShield, 
  FiTruck, 
  FiRotateCcw, 
  FiLock,
  FiGithub,
  FiTwitter,
  FiInstagram
} from "react-icons/fi";
import styles from "./footer.module.css";

const Footer = () => {
  return (
    <footer className={styles.footer}>
      {/* Top Features Strip */}
      <div className={styles.featuresStrip}>
        <div className={styles.featureItem}>
          <FiTruck className={styles.featureIcon} />
          <div>
            <h4 className={styles.featureTitle}>Express Nationwide Delivery</h4>
            <p className={styles.featureDesc}>Fast dispatch within 24 hours</p>
          </div>
        </div>
        <div className={styles.featureItem}>
          <FiShield className={styles.featureIcon} />
          <div>
            <h4 className={styles.featureTitle}>100% Genuine Guarantee</h4>
            <p className={styles.featureDesc}>Direct from verified manufacturers</p>
          </div>
        </div>
        <div className={styles.featureItem}>
          <FiRotateCcw className={styles.featureIcon} />
          <div>
            <h4 className={styles.featureTitle}>Hassle-Free Returns</h4>
            <p className={styles.featureDesc}>7-day buyer protection policy</p>
          </div>
        </div>
        <div className={styles.featureItem}>
          <FiLock className={styles.featureIcon} />
          <div>
            <h4 className={styles.featureTitle}>Encrypted Checkout</h4>
            <p className={styles.featureDesc}>256-bit bank-grade SSL security</p>
          </div>
        </div>
      </div>

      <div className={styles.footerContainer}>
        <div className={styles.footerMainGrid}>
          {/* Brand Column */}
          <div className={styles.brandCol}>
            <Link to="/" className={styles.logoGroup}>
              <img src="/flash-logo.png" alt="FLASH - E-Commerce For Everyone" className={styles.footerLogoImg} />
            </Link>
            <p className={styles.brandText}>
              Next-generation high-performance e-commerce marketplace powered by real-time inventory management, automated seller workflows, and instant checkout architecture.
            </p>
            <div className={styles.socialRow}>
              <a href="#" className={styles.socialLink} aria-label="Twitter"><FiTwitter /></a>
              <a href="#" className={styles.socialLink} aria-label="GitHub"><FiGithub /></a>
              <a href="#" className={styles.socialLink} aria-label="Instagram"><FiInstagram /></a>
            </div>
          </div>

          {/* Quick Links Column */}
          <div className={styles.linkCol}>
            <h4 className={styles.colHeading}>Explore Marketplace</h4>
            <ul className={styles.linkList}>
              <li><Link to="/?category=Electronics">Electronics & Tech</Link></li>
              <li><Link to="/?category=Fashion">Fashion & Apparel</Link></li>
              <li><Link to="/?category=Home">Home & Living</Link></li>
              <li><Link to="/?category=Footwear">Footwear Collection</Link></li>
              <li><Link to="/?category=Beauty">Beauty & Essentials</Link></li>
            </ul>
          </div>

          {/* Customer Support Column */}
          <div className={styles.linkCol}>
            <h4 className={styles.colHeading}>Customer Hub</h4>
            <ul className={styles.linkList}>
              <li><Link to="/orders">Track Order Status</Link></li>
              <li><Link to="/cart">Shopping Bag</Link></li>
              <li><Link to="/wishlist">Saved Wishlist</Link></li>
              <li><Link to="/profile">Account Settings</Link></li>
              <li><Link to="/login">Customer Login</Link></li>
            </ul>
          </div>

          {/* Merchant & Partner Column */}
          <div className={styles.linkCol}>
            <h4 className={styles.colHeading}>Merchant Center</h4>
            <ul className={styles.linkList}>
              <li><Link to="/seller/register">Become a Seller</Link></li>
              <li><Link to="/seller/dashboard">Seller Portal</Link></li>
              <li><Link to="/admin/dashboard">Admin Moderation</Link></li>
              <li><a href="#">API Documentation</a></li>
              <li><a href="#">Partner Guidelines</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright Strip */}
        <div className={styles.bottomBar}>
          <p className={styles.copyrightText}>
            © {new Date().getFullYear()} FLASH E-Commerce Technologies Inc. All rights reserved.
          </p>
          <div className={styles.legalLinks}>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Security Statement</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
