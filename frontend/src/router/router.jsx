import { createBrowserRouter } from "react-router-dom";
import React from "react";
import Layout from "../pages/Layout";
import Home from "../pages/Home";
import ProductDetails from "../pages/ProductDetails";
import CartPage from "../pages/CartPage";
import CheckoutPage from "../pages/CheckoutPage";
import OrdersPage from "../pages/OrdersPage";
import WishlistPage from "../pages/WishlistPage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import SellerRegisterPage from "../pages/SellerRegisterPage";
import UserProfilePage from "../pages/UserProfilePage";
import SellerDashboardPage from "../pages/SellerDashboardPage";
import AdminDashboardPage from "../pages/AdminDashboardPage";

export const myRoutes = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: "/product/:id", element: <ProductDetails /> },
      { path: "/products/:id", element: <ProductDetails /> },
      { path: "/cart", element: <CartPage /> },
      { path: "/cartpage/:id", element: <CartPage /> },
      { path: "/checkout", element: <CheckoutPage /> },
      { path: "/payment/:id", element: <CheckoutPage /> },
      { path: "/orders", element: <OrdersPage /> },
      { path: "/orderpage/:id", element: <OrdersPage /> },
      { path: "/wishlist", element: <WishlistPage /> },
      { path: "/login", element: <LoginPage /> },
      { path: "/register", element: <RegisterPage /> },
      { path: "/signup", element: <RegisterPage /> },
      { path: "/seller/register", element: <SellerRegisterPage /> },
      { path: "/signupproductowner", element: <SellerRegisterPage /> },
      { path: "/profile", element: <UserProfilePage /> },
      { path: "/userprofile", element: <UserProfilePage /> },
      { path: "/seller/dashboard", element: <SellerDashboardPage /> },
      { path: "/addproduct", element: <SellerDashboardPage /> },
      { path: "/admin/dashboard", element: <AdminDashboardPage /> },
      { path: "/admindashboard", element: <AdminDashboardPage /> },
    ],
  },
]);
