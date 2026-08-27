import React, { useState, useEffect } from "react";
import styles from "./orderhistory.module.css";
import toast from "react-hot-toast";
import apiClient from "../api/apiClient";

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const userID = sessionStorage.getItem("userID") || localStorage.getItem("userID");

  useEffect(() => {
    if (userID) {
      apiClient
        .get(`/api/v1/orders/user/${userID}`)
        .then((res) => {
          const data = res.data?.data || res.data;
          setOrders(Array.isArray(data) ? data : []);
        })
        .catch((err) => {
          console.error("Error fetching orders:", err);
          toast.error("Error fetching order history");
        });
    }
  }, [userID]);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Your Orders</h1>
      {orders.length === 0 ? (
        <p>You have not placed any orders yet.</p>
      ) : (
        <div className={styles.orderGrid}>
          {orders.map((order) => (
            <div key={order.id} className={styles.orderCard}>
              <h3>Order #{order.id}</h3>
              <p>
                <strong>Product:</strong> {order.product?.name || order.productNameAtPurchase || "Product"}
              </p>
              <p>
                <strong>Price:</strong> ₹{order.product?.price || order.totalPrice}
              </p>
              <p>
                <strong>Status:</strong> {order.status}
              </p>
              <p>
                <strong>Order Date:</strong>{" "}
                {order.orderDate ? new Date(order.orderDate).toLocaleString() : "N/A"}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
