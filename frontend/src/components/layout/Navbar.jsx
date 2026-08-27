import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { 
  FiSearch, 
  FiShoppingBag, 
  FiHeart, 
  FiUser, 
  FiLogOut, 
  FiZap, 
  FiBox, 
  FiShield, 
  FiPlusSquare 
} from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import styles from "./navbar.module.css";

const Navbar = () => {
  const { user, role, isAuthenticated, logout } = useAuth();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const [searchQuery, setSearchQuery] = useState("");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const userRole = (role || user?.role || localStorage.getItem("role") || "").toUpperCase();
  const isSeller = userRole.includes("SELLER");
  const isAdmin = userRole.includes("ADMIN");

  useEffect(() => {
    setUserMenuOpen(false);
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };
    if (userMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [userMenuOpen]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate("/login");
  };

  return (
    <header className={styles.header}>
      <div className={styles.navContainer}>
        {/* Brand Logo */}
        <Link to="/" className={styles.logoGroup}>
          <img src="/flash-logo.png" alt="FLASH - E-Commerce For Everyone" className={styles.brandLogoImg} />
        </Link>

        {/* Search Toolbar */}
        <form onSubmit={handleSearchSubmit} className={styles.searchForm}>
          <FiSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search electronics, fashion, essentials..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
          <button type="submit" className={styles.searchBtn}>
            Search
          </button>
        </form>

        {/* Navigation Action Strip */}
        <div className={styles.actionStrip}>
          {/* Always Visible Seller / Merchant Shortcut Button */}
          {isSeller ? (
            <Link to="/seller/dashboard" className={styles.roleActionBtn} title="Seller Studio - Add & Manage Products">
              <FiPlusSquare /> Seller Studio (+ Add Product)
            </Link>
          ) : isAdmin ? (
            <Link to="/admin/dashboard" className={styles.roleActionBtn} title="Admin Portal">
              <FiShield /> Admin Portal
            </Link>
          ) : (
            <Link to="/seller/register" className={styles.roleActionBtn} title="Sell on FLASH Marketplace">
              <FiPlusSquare /> Sell on FLASH
            </Link>
          )}

          {/* Wishlist Link */}
          <Link to="/wishlist" className={styles.iconAction} title="Wishlist">
            <FiHeart className={styles.actionIcon} />
            {wishlistCount > 0 && (
              <span className={styles.badgeCounter}>{wishlistCount}</span>
            )}
            <span className={styles.iconLabel}>Saved</span>
          </Link>

          {/* Cart Link */}
          <Link to="/cart" className={styles.iconAction} title="Cart">
            <FiShoppingBag className={styles.actionIcon} />
            {cartCount > 0 && (
              <span className={styles.cartBadgeCounter}>{cartCount}</span>
            )}
            <span className={styles.iconLabel}>Bag</span>
          </Link>

          {/* User Account / Auth Dropdown */}
          <div className={styles.userMenuWrapper} ref={menuRef}>
            {isAuthenticated ? (
              <div className={styles.userTriggerContainer}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className={styles.userTriggerBtn}
                >
                  <div className={styles.userAvatar}>
                    {user?.fullName ? user.fullName[0].toUpperCase() : "U"}
                  </div>
                  <span className={styles.userNameText}>
                    {user?.fullName?.split(" ")[0] || "Account"}
                  </span>
                </button>

                {userMenuOpen && (
                  <div className={styles.dropdownMenu}>
                    <div className={styles.menuHeader}>
                      <p className={styles.menuUserName}>{user?.fullName || "User"}</p>
                      <p className={styles.menuUserEmail}>{user?.email}</p>
                      <span className={styles.roleBadge}>{userRole}</span>
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className={styles.menuItem}
                    >
                      <FiUser /> Profile & Account
                    </Link>

                    <Link
                      to="/orders"
                      onClick={() => setUserMenuOpen(false)}
                      className={styles.menuItem}
                    >
                      <FiBox /> Order History
                    </Link>

                    <Link
                      to={isSeller ? "/seller/dashboard" : "/seller/register"}
                      onClick={() => setUserMenuOpen(false)}
                      className={styles.menuItem}
                    >
                      <FiPlusSquare /> {isSeller ? "Seller Studio (+ Add Product)" : "Become a Merchant / Sell"}
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin/dashboard"
                        onClick={() => setUserMenuOpen(false)}
                        className={styles.menuItem}
                      >
                        <FiShield /> Admin Portal
                      </Link>
                    )}

                    <button onClick={handleLogout} className={styles.logoutBtn}>
                      <FiLogOut /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className={styles.authButtonsGroup}>
                <Link to="/login" className={styles.loginLink}>
                  Sign In
                </Link>
                <Link to="/register" className={styles.registerBtn}>
                  Join Now
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
