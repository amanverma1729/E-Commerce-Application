import React, { useState, useEffect } from "react";
import style from "./navbar.module.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FiZap,
  FiUser,
  FiShoppingCart,
  FiLogOut,
  FiLogIn,
  FiPackage,
  FiPlusSquare,
  FiShield,
  FiHome,
  FiUserPlus,
  FiGrid,
  FiMenu,
  FiX,
} from "react-icons/fi";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState({
    userID: sessionStorage.getItem("userID"),
    productOwnerId: sessionStorage.getItem("productOwnerId"),
    adminId: sessionStorage.getItem("adminId"),
  });

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setLoggedIn({
      userID: sessionStorage.getItem("userID"),
      productOwnerId: sessionStorage.getItem("productOwnerId"),
      adminId: sessionStorage.getItem("adminId"),
    });
    setMobileMenuOpen(false);
  }, [location]);

  const logout = () => {
    if (loggedIn.productOwnerId) {
      sessionStorage.removeItem("productOwnerId");
    }
    if (loggedIn.userID) {
      sessionStorage.removeItem("userID");
    }
    if (loggedIn.adminId) {
      sessionStorage.removeItem("adminId");
    }
    toast.success("Logged out successfully");
    setLoggedIn({ userID: null, productOwnerId: null, adminId: null });
    setMobileMenuOpen(false);
    navigate("/");
  };

  let profileRoute = "/";
  let roleBadge = "";
  if (loggedIn.adminId) {
    profileRoute = "/admindashboard";
    roleBadge = "ADMIN";
  } else if (loggedIn.productOwnerId) {
    profileRoute = "/productlist";
    roleBadge = "SELLER";
  } else if (loggedIn.userID) {
    profileRoute = "/userprofile";
    roleBadge = "CUSTOMER";
  }

  return (
    <nav className={`${style.navContainer} ${scrolled ? style.scrolledNav : ""}`}>
      <div className={style.navInner}>
        {/* Brand Logo */}
        <Link to="/" className={style.brandLogo} onClick={() => setMobileMenuOpen(false)}>
          <div className={style.logoBadge}>
            <FiZap className={style.zapIcon} />
          </div>
          <span className={style.logoText}>
            FLASH<span className={style.logoDot}>.</span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className={style.navCenter}>
          <Link
            to="/"
            className={`${style.navLink} ${
              location.pathname === "/" ? style.activeLink : ""
            }`}
          >
            <FiHome className={style.linkIcon} />
            <span>Home</span>
          </Link>

          {loggedIn.userID && (
            <>
              <Link
                to={`/orderpage/${loggedIn.userID}`}
                className={`${style.navLink} ${
                  location.pathname.startsWith("/orderpage")
                    ? style.activeLink
                    : ""
                }`}
              >
                <FiPackage className={style.linkIcon} />
                <span>My Orders</span>
              </Link>
              <Link
                to={`/cartpage/${loggedIn.userID}`}
                className={`${style.navLink} ${
                  location.pathname.startsWith("/cartpage")
                    ? style.activeLink
                    : ""
                }`}
              >
                <FiShoppingCart className={style.linkIcon} />
                <span>Cart</span>
              </Link>
            </>
          )}

          {loggedIn.productOwnerId && (
            <>
              <Link
                to="/productlist"
                className={`${style.navLink} ${
                  location.pathname === "/productlist" ? style.activeLink : ""
                }`}
              >
                <FiGrid className={style.linkIcon} />
                <span>My Products</span>
              </Link>
              <Link
                to="/addproduct"
                className={`${style.navLink} ${
                  location.pathname === "/addproduct" ? style.activeLink : ""
                }`}
              >
                <FiPlusSquare className={style.linkIcon} />
                <span>Add Product</span>
              </Link>
              <Link
                to="/manageorders"
                className={`${style.navLink} ${
                  location.pathname === "/manageorders" ? style.activeLink : ""
                }`}
              >
                <FiPackage className={style.linkIcon} />
                <span>Manage Orders</span>
              </Link>
            </>
          )}

          {loggedIn.adminId && (
            <Link
              to="/admindashboard"
              className={`${style.navLink} ${
                location.pathname === "/admindashboard" ? style.activeLink : ""
              }`}
            >
              <FiShield className={style.linkIcon} />
              <span>Admin Portal</span>
            </Link>
          )}
        </div>

        {/* Desktop Right Auth Actions */}
        <div className={style.navRight}>
          {loggedIn.productOwnerId || loggedIn.userID || loggedIn.adminId ? (
            <div className={style.userMenu}>
              <span className={style.roleTag}>{roleBadge}</span>
              <Link to={profileRoute} className={style.profileBtn}>
                <FiUser />
                <span>Profile</span>
              </Link>
              <button onClick={logout} className={style.logoutBtn} title="Logout">
                <FiLogOut />
                <span className={style.logoutText}>Logout</span>
              </button>
            </div>
          ) : (
            <div className={style.authBtns}>
              <Link to="/login" className={style.loginBtn}>
                <FiLogIn />
                <span>Sign In</span>
              </Link>
              <Link to="/SignupProductOwner" className={style.sellerBtn}>
                <FiZap />
                <span>Sell on Flash</span>
              </Link>
              <Link to="/signup" className={style.signupBtn}>
                <FiUserPlus />
                <span>Register</span>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Toggle Button */}
        <button
          className={style.hamburgerBtn}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle mobile menu"
        >
          {mobileMenuOpen ? <FiX /> : <FiMenu />}
        </button>
      </div>

      {/* Mobile Drawer Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className={style.mobileDrawerOverlay}
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className={style.mobileDrawerContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={style.mobileDrawerHeader}>
              <div className={style.logoRow}>
                <div className={style.logoBadge}>
                  <FiZap className={style.zapIcon} />
                </div>
                <span className={style.logoText}>FLASH.</span>
              </div>
              <button
                className={style.closeDrawerBtn}
                onClick={() => setMobileMenuOpen(false)}
              >
                <FiX />
              </button>
            </div>

            <div className={style.mobileDrawerBody}>
              <Link
                to="/"
                className={style.mobileNavLink}
                onClick={() => setMobileMenuOpen(false)}
              >
                <FiHome />
                <span>Home</span>
              </Link>

              {loggedIn.userID && (
                <>
                  <Link
                    to={`/orderpage/${loggedIn.userID}`}
                    className={style.mobileNavLink}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FiPackage />
                    <span>My Orders</span>
                  </Link>
                  <Link
                    to={`/cartpage/${loggedIn.userID}`}
                    className={style.mobileNavLink}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FiShoppingCart />
                    <span>My Cart</span>
                  </Link>
                </>
              )}

              {loggedIn.productOwnerId && (
                <>
                  <Link
                    to="/productlist"
                    className={style.mobileNavLink}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FiGrid />
                    <span>My Products</span>
                  </Link>
                  <Link
                    to="/addproduct"
                    className={style.mobileNavLink}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FiPlusSquare />
                    <span>Add Product</span>
                  </Link>
                  <Link
                    to="/manageorders"
                    className={style.mobileNavLink}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FiPackage />
                    <span>Manage Orders</span>
                  </Link>
                </>
              )}

              {loggedIn.adminId && (
                <Link
                  to="/admindashboard"
                  className={style.mobileNavLink}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <FiShield />
                  <span>Admin Portal</span>
                </Link>
              )}

              <div className={style.mobileDrawerDivider} />

              {loggedIn.productOwnerId || loggedIn.userID || loggedIn.adminId ? (
                <div className={style.mobileUserMenu}>
                  <div className={style.mobileUserInfo}>
                    <span className={style.roleTag}>{roleBadge}</span>
                    <Link
                      to={profileRoute}
                      className={style.mobileProfileBtn}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <FiUser />
                      <span>View Profile</span>
                    </Link>
                  </div>
                  <button onClick={logout} className={style.mobileLogoutBtn}>
                    <FiLogOut />
                    <span>Logout Account</span>
                  </button>
                </div>
              ) : (
                <div className={style.mobileAuthBtns}>
                  <Link
                    to="/login"
                    className={style.mobileLoginBtn}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FiLogIn />
                    <span>Sign In</span>
                  </Link>
                  <Link
                    to="/SignupProductOwner"
                    className={style.mobileSellerBtn}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FiZap />
                    <span>Become a Seller</span>
                  </Link>
                  <Link
                    to="/signup"
                    className={style.mobileSignupBtn}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FiUserPlus />
                    <span>Register Account</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;


