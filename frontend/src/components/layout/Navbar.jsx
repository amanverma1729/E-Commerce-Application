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
  FiPlusSquare,
  FiMenu,
  FiX,
  FiHome,
  FiLogIn,
  FiUserPlus
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const userRole = (role || user?.role || localStorage.getItem("role") || "").toUpperCase();
  const isSeller = userRole.includes("SELLER");
  const isAdmin = userRole.includes("ADMIN");

  useEffect(() => {
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
  }, [location]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  // Close desktop dropdown on click outside & handle Escape key for mobile drawer
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setUserMenuOpen(false);
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
    navigate("/login");
  };

  return (
    <header className={styles.header}>
      <div className={styles.navContainer}>
        {/* Brand Logo */}
        <Link to="/" className={styles.logoGroup} onClick={() => setMobileMenuOpen(false)}>
          <img src="/flash-logo.png" alt="FLASH - E-Commerce For Everyone" className={styles.brandLogoImg} />
        </Link>

        {/* Desktop Search Toolbar */}
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

        {/* Desktop Navigation Action Strip */}
        <div className={styles.actionStrip}>
          {/* Seller / Merchant Shortcut Button */}
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
                  aria-expanded={userMenuOpen}
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

        {/* Mobile Header Actions & Hamburger Menu Toggle */}
        <div className={styles.mobileActionsGroup}>
          <Link to="/wishlist" className={styles.mobileQuickIcon} title="Saved Items">
            <FiHeart />
            {wishlistCount > 0 && <span className={styles.badgeCounter}>{wishlistCount}</span>}
          </Link>

          <Link to="/cart" className={styles.mobileQuickIcon} title="Cart Bag">
            <FiShoppingBag />
            {cartCount > 0 && <span className={styles.cartBadgeCounter}>{cartCount}</span>}
          </Link>

          <button
            className={`${styles.hamburgerBtn} ${mobileMenuOpen ? styles.hamburgerActive : ""}`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className={styles.mobileDrawerOverlay}
          onClick={() => setMobileMenuOpen(false)}
          aria-modal="true"
          role="dialog"
        >
          <div
            className={styles.mobileDrawerContent}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header with Brand Logo */}
            <div className={styles.mobileDrawerHeader}>
              <Link to="/" onClick={() => setMobileMenuOpen(false)}>
                <img src="/flash-logo.png" alt="FLASH Logo" className={styles.drawerLogoImg} />
              </Link>
              <button
                className={styles.closeDrawerBtn}
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
              >
                <FiX />
              </button>
            </div>

            {/* Drawer Body */}
            <div className={styles.mobileDrawerBody}>
              {/* Main Navigation Links */}
              <div className={styles.mobileNavSection}>
                <p className={styles.mobileSectionLabel}>Menu</p>

                <Link
                  to="/"
                  className={`${styles.mobileNavLink} ${location.pathname === "/" ? styles.activeMobileLink : ""}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <FiHome className={styles.mobileNavIcon} />
                  <span>Home</span>
                </Link>

                <Link
                  to="/wishlist"
                  className={`${styles.mobileNavLink} ${location.pathname === "/wishlist" ? styles.activeMobileLink : ""}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <FiHeart className={styles.mobileNavIcon} />
                  <span>Wishlist & Saved</span>
                  {wishlistCount > 0 && (
                    <span className={styles.mobileBadgeCount}>{wishlistCount}</span>
                  )}
                </Link>

                <Link
                  to="/cart"
                  className={`${styles.mobileNavLink} ${location.pathname === "/cart" ? styles.activeMobileLink : ""}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <FiShoppingBag className={styles.mobileNavIcon} />
                  <span>My Cart / Bag</span>
                  {cartCount > 0 && (
                    <span className={styles.mobileCartBadgeCount}>{cartCount}</span>
                  )}
                </Link>

                {isAuthenticated && (
                  <Link
                    to="/orders"
                    className={`${styles.mobileNavLink} ${location.pathname === "/orders" ? styles.activeMobileLink : ""}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FiBox className={styles.mobileNavIcon} />
                    <span>My Order History</span>
                  </Link>
                )}
              </div>

              <div className={styles.mobileDrawerDivider} />

              {/* Merchant / Seller Section */}
              <div className={styles.mobileNavSection}>
                <p className={styles.mobileSectionLabel}>Marketplace</p>
                {isSeller ? (
                  <Link
                    to="/seller/dashboard"
                    className={styles.mobileSellerCard}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FiPlusSquare className={styles.mobileSellerIcon} />
                    <div>
                      <div className={styles.mobileSellerTitle}>Seller Studio</div>
                      <div className={styles.mobileSellerSub}>Manage listings & inventory</div>
                    </div>
                  </Link>
                ) : isAdmin ? (
                  <Link
                    to="/admin/dashboard"
                    className={styles.mobileAdminCard}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FiShield className={styles.mobileSellerIcon} />
                    <div>
                      <div className={styles.mobileSellerTitle}>Admin Control Center</div>
                      <div className={styles.mobileSellerSub}>Platform overview & approvals</div>
                    </div>
                  </Link>
                ) : (
                  <Link
                    to="/seller/register"
                    className={styles.mobileSellerCard}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FiZap className={styles.mobileSellerIcon} />
                    <div>
                      <div className={styles.mobileSellerTitle}>Sell on FLASH</div>
                      <div className={styles.mobileSellerSub}>Start selling your products today</div>
                    </div>
                  </Link>
                )}
              </div>

              <div className={styles.mobileDrawerDivider} />

              {/* Account / Authentication Section */}
              <div className={styles.mobileNavSection}>
                <p className={styles.mobileSectionLabel}>Account</p>
                {isAuthenticated ? (
                  <div className={styles.mobileUserCard}>
                    <div className={styles.mobileUserInfo}>
                      <div className={styles.userAvatar}>
                        {user?.fullName ? user.fullName[0].toUpperCase() : "U"}
                      </div>
                      <div className={styles.mobileUserDetails}>
                        <p className={styles.mobileUserName}>{user?.fullName || "Valued User"}</p>
                        <p className={styles.mobileUserEmail}>{user?.email}</p>
                        <span className={styles.roleBadge}>{userRole}</span>
                      </div>
                    </div>

                    <Link
                      to="/profile"
                      className={styles.mobileProfileLink}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <FiUser /> View Profile & Account
                    </Link>

                    <button onClick={handleLogout} className={styles.mobileLogoutBtn}>
                      <FiLogOut /> Log Out
                    </button>
                  </div>
                ) : (
                  <div className={styles.mobileAuthGrid}>
                    <Link
                      to="/login"
                      className={styles.mobileLoginBtn}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <FiLogIn /> Sign In
                    </Link>
                    <Link
                      to="/register"
                      className={styles.mobileRegisterBtn}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <FiUserPlus /> Join Now
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
