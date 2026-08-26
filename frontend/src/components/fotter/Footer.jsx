import React, { useState } from "react";
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
  FaGithub,
  FaCreditCard,
  FaShieldAlt,
  FaShippingFast,
} from "react-icons/fa";
import { FiZap, FiSend } from "react-icons/fi";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import styles from "./footer.module.css";

const Footer = () => {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      toast.success("Subscribed to FLASH VIP updates!");
      setEmail("");
    }
  };

  return (
    <footer className={styles.footerContainer}>
      <div className={styles.footerInner}>
        {/* Top Newsletter & Brand Info */}
        <div className={styles.topSection}>
          <div className={styles.brandCol}>
            <div className={styles.logoRow}>
              <div className={styles.logoBadge}>
                <FiZap />
              </div>
              <span className={styles.logoText}>FLASH.</span>
            </div>
            <p className={styles.brandDesc}>
              Experience real-time shopping with instant order processing, verified local sellers, and express delivery.
            </p>
          </div>

          <div className={styles.newsletterCol}>
            <h4 className={styles.colTitle}>Subscribe for Exclusive Offers</h4>
            <form onSubmit={handleSubscribe} className={styles.subscribeForm}>
              <input
                type="email"
                placeholder="Enter your email..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button type="submit">
                <FiSend /> Join
              </button>
            </form>
          </div>
        </div>

        {/* Links Grid */}
        <div className={styles.linksGrid}>
          <div className={styles.linkGroup}>
            <h4>Shop Categories</h4>
            <ul>
              <li><Link to="/">Shoes & Sneakers</Link></li>
              <li><Link to="/">T-Shirts & Tops</Link></li>
              <li><Link to="/">Denim & Jeans</Link></li>
              <li><Link to="/">Boots & Footwear</Link></li>
            </ul>
          </div>

          <div className={styles.linkGroup}>
            <h4>Customer Care</h4>
            <ul>
              <li><Link to="/userprofile">My Account</Link></li>
              <li><Link to="/">Order Tracking</Link></li>
              <li><Link to="/">Help & FAQs</Link></li>
              <li><Link to="/">Return Policy</Link></li>
            </ul>
          </div>

          <div className={styles.linkGroup}>
            <h4>Merchant Center</h4>
            <ul>
              <li><Link to="/SignupProductOwner">Become a Seller</Link></li>
              <li><Link to="/login">Seller Portal Login</Link></li>
              <li><Link to="/productlist">Manage Inventory</Link></li>
              <li><Link to="/manageorders">Fulfillment Center</Link></li>
            </ul>
          </div>

          <div className={styles.linkGroup}>
            <h4>Payment & Trust</h4>
            <div className={styles.trustBadges}>
              <div className={styles.badgeItem}>
                <FaShippingFast className={styles.badgeIcon} />
                <span>Express Delivery</span>
              </div>
              <div className={styles.badgeItem}>
                <FaShieldAlt className={styles.badgeIcon} />
                <span>100% Genuine</span>
              </div>
              <div className={styles.badgeItem}>
                <FaCreditCard className={styles.badgeIcon} />
                <span>Secure Payments</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Social & Copyright */}
        <div className={styles.bottomSection}>
          <div className={styles.socialIcons}>
            <a href="#!" aria-label="Facebook"><FaFacebookF /></a>
            <a href="#!" aria-label="Twitter"><FaTwitter /></a>
            <a href="#!" aria-label="Instagram"><FaInstagram /></a>
            <a href="#!" aria-label="LinkedIn"><FaLinkedinIn /></a>
            <a href="#!" aria-label="Github"><FaGithub /></a>
          </div>

          <p className={styles.copyright}>
            © 2026 FLASH E-Commerce Platform. Built for Next-Gen Shopping.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

