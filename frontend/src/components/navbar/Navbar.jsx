import React, { Fragment, useState, useEffect } from "react";
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
} from "react-icons/fi";

const Navbar = () => {
  const [loggedIn, setLoggedIn] = useState({
    userID: sessionStorage.getItem("userID"),
    productOwnerId: sessionStorage.getItem("productOwnerId"),
    adminId: sessionStorage.getItem("adminId"),
  });

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setLoggedIn({
      userID: sessionStorage.getItem("userID"),
      productOwnerId: sessionStorage.getItem("productOwnerId"),
      adminId: sessionStorage.getItem("adminId"),
    });
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
    <nav className={style.navContainer}>
      <div className={style.navInner}>
        {/* Brand Logo */}
        <Link to="/" className={style.brandLogo}>
          <div className={style.logoBadge}>
            <FiZap className={style.zapIcon} />
          </div>
          <span className={style.logoText}>
            FLASH<span className={style.logoDot}>.</span>
          </span>
        </Link>

        {/* Center / Primary Navigation Links */}
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

        {/* Right Navigation & Auth Actions */}
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
      </div>
    </nav>
  );
};

export default Navbar;

