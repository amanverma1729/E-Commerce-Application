import React from "react";
import { Navigate, useLocation } from "react-router-dom";

const UserPrivate = ({ children }) => {
  const location = useLocation();
  const userID =
    (sessionStorage.getItem("userID") || localStorage.getItem("userID"))?.trim() || "";

  if (!userID) {
    console.warn("UserPrivate: No user session found, redirecting to login...");
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
};

export default UserPrivate;
