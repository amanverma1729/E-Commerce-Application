import React, { useState, useEffect } from "react";
import styles from "./manageorder.module.css";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
  FiPackage,
  FiTruck,
  FiXCircle,
  FiClock,
  FiCheckCircle,
  FiShoppingBag,
  FiArrowLeft,
} from "react-icons/fi";
import apiClient from "../api/apiClient";
import { getRelevantProductImage } from "../utils/productImages";

const ManageOrders = () => {
  const productOwnerId = Number(sessionStorage.getItem("productOwnerId") || localStorage.getItem("productOwnerId"));
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (productOwnerId) {
      apiClient
        .get(`/api/v1/orders/seller/${productOwnerId}`)
        .then((res) => {
          const list = Array.isArray(res.data) ? res.data : (res.data?.data || []);
          setOrders(list);
        })
        .catch((err) => {
          // Fallback to legacy endpoint if seller endpoint varies
          apiClient.get(`/api/v1/orders/owner/${productOwnerId}`)
            .then((res) => {
              const list = Array.isArray(res.data) ? res.data : (res.data?.data || []);
              setOrders(list);
            })
            .catch((e) => {
              console.error("Error fetching orders:", e);
              toast.error("Error fetching incoming orders");
            });
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      toast.error("Product owner not logged in");
      setLoading(false);
    }
  }, [productOwnerId]);

  const markOrderAsShipped = (orderId) => {
    apiClient
      .put(`/api/v1/orders/${orderId}`, { status: "SHIPPED" })
      .then(() => {
        toast.success(`Order #${orderId} marked as SHIPPED`);
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.id === orderId ? { ...order, status: "SHIPPED" } : order
          )
        );
      })
      .catch((err) => {
        console.error("Error updating order:", err);
        toast.error(err.response?.data?.message || "Failed to update order status");
      });
  };

  const cancelOrder = (orderId) => {
    apiClient
      .delete(`/api/v1/orders/${orderId}`)
      .then(() => {
        toast.success("Order cancelled and removed");
        setOrders((prevOrders) =>
          prevOrders.filter((order) => order.id !== orderId)
        );
      })
      .catch((err) => {
        console.error("Error cancelling order:", err);
        toast.error(err.response?.data?.message || "Failed to cancel order");
      });
  };

  const getStatusBadge = (status) => {
    const s = (status || "").toLowerCase();
    if (s.includes("shipped")) {
      return (
        <span className={styles.statusShipped}>
          <FiTruck /> Shipped
        </span>
      );
    } else if (s.includes("paid") || s.includes("confirmed")) {
      return (
        <span className={styles.statusSuccess}>
          <FiCheckCircle /> {status}
        </span>
      );
    } else {
      return (
        <span className={styles.statusPending}>
          <FiClock /> {status || "Processing"}
        </span>
      );
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        <button onClick={() => navigate("/productlist")} className={styles.backButton}>
          <FiArrowLeft /> Back to Products
        </button>

        <div className={styles.headerRow}>
          <div className={styles.iconBadge}>
            <FiTruck />
          </div>
          <div>
            <h1 className={styles.title}>Fulfillment Hub</h1>
            <p className={styles.subtitle}>
              Manage customer orders, update shipping statuses, and manage cancellations
            </p>
          </div>
        </div>

        {loading ? (
          <div className={styles.loadingState}>
            <div className={styles.spinner} />
            <p>Loading incoming orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className={styles.emptyState}>
            <FiShoppingBag className={styles.emptyIcon} />
            <h2>No Active Orders</h2>
            <p>You currently don't have any customer orders waiting for fulfillment.</p>
          </div>
        ) : (
          <div className={styles.orderGrid}>
            {orders.map((order) => {
              const productName = order.productNameAtPurchase || order.product?.name || "Product";
              const unitPrice = order.unitPriceAtPurchase || order.product?.price || order.totalPrice;
              const productImg = order.product?.productImageBase64;

              return (
                <div key={order.id} className={styles.orderCard}>
                  <div className={styles.cardHeader}>
                    <div>
                      <span className={styles.orderRef}>Order #{order.id}</span>
                      <span className={styles.orderCategory}>
                        {order.product?.category || "General"}
                      </span>
                    </div>
                    {getStatusBadge(order.status)}
                  </div>

                  <div className={styles.cardBody}>
                    <div className={styles.thumbWrapper}>
                      <img
                        src={getRelevantProductImage(order.product || { name: productName })}
                        alt={productName}
                      />
                    </div>

                    <div className={styles.productDetails}>
                      <h3 className={styles.productName}>{productName}</h3>
                      <div className={styles.priceRow}>
                        <span className={styles.priceValue}>₹{order.totalPrice || unitPrice}</span>
                        <span className={styles.paymentTag}>
                          Method: {order.paymentMethod || "COD"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.cardFooter}>
                    <button
                      className={styles.cancelButton}
                      onClick={() => cancelOrder(order.id)}
                    >
                      <FiXCircle /> Cancel Order
                    </button>

                    <button
                      className={styles.shippedButton}
                      onClick={() => markOrderAsShipped(order.id)}
                      disabled={order.status === "SHIPPED" || order.status === "DELIVERED" || order.status === "CANCELLED"}
                    >
                      <FiTruck /> {order.status === "SHIPPED" ? "Shipped" : "Mark as Shipped"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageOrders;
