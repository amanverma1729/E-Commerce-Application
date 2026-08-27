import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useParams, useNavigate } from "react-router-dom";
import styles from "./orderPage.module.css";
import {
  FiPackage,
  FiUser,
  FiShoppingCart,
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiArrowRight,
  FiShoppingBag,
} from "react-icons/fi";
import apiClient from "../api/apiClient";

const OrdersPage = () => {
  const { id: userIdParam } = useParams();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userIdParam) {
      apiClient
        .get(`/api/v1/orders/user/${userIdParam}`)
        .then((res) => {
          const list = Array.isArray(res.data) ? res.data : (res.data?.data || []);
          setOrders(list);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching orders:", err);
          toast.error("Error fetching your orders");
          setLoading(false);
        });
    } else {
      toast.error("User ID not provided");
      setLoading(false);
    }
  }, [userIdParam]);

  const handleRemoveFromOrder = async (orderId) => {
    try {
      await apiClient.delete(`/api/v1/orders/${orderId}`);
      toast.success("Order cancelled successfully");
      setOrders(orders.filter((order) => order.id !== orderId));
    } catch (error) {
      console.error("Error cancelling order:", error);
      toast.error(error.response?.data?.message || "Failed to cancel order");
    }
  };

  const getStatusBadge = (status) => {
    const s = (status || "").toLowerCase();
    if (s.includes("paid") || s.includes("confirmed") || s.includes("delivered")) {
      return (
        <span className={styles.statusSuccess}>
          <FiCheckCircle /> {status || "Paid"}
        </span>
      );
    } else if (s.includes("pending")) {
      return (
        <span className={styles.statusPending}>
          <FiClock /> {status || "Pending"}
        </span>
      );
    } else {
      return (
        <span className={styles.statusInfo}>
          <FiPackage /> {status || "Processing"}
        </span>
      );
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingWrapper}>
        <div className={styles.spinner} />
        <p>Loading your orders...</p>
      </div>
    );
  }

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        {/* Navigation Shortcut Header */}
        <div className={styles.shortcutRow}>
          <button
            className={styles.shortcutBtn}
            onClick={() => navigate("/userprofile")}
          >
            <FiUser /> Profile
          </button>
          <button
            className={styles.shortcutBtn}
            onClick={() => navigate(`/cartpage/${userIdParam}`)}
          >
            <FiShoppingCart /> Cart
          </button>
        </div>

        <div className={styles.headerTitleRow}>
          <div className={styles.iconBadge}>
            <FiPackage />
          </div>
          <div>
            <h1 className={styles.pageTitle}>Order History</h1>
            <p className={styles.pageSubtitle}>
              Track your active orders and review previous purchases
            </p>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className={styles.emptyOrders}>
            <FiShoppingBag className={styles.emptyIcon} />
            <h2>No orders found</h2>
            <p>You haven't placed any orders yet. Start exploring our store today!</p>
            <button className={styles.shopBtn} onClick={() => navigate("/")}>
              Start Shopping
            </button>
          </div>
        ) : (
          <div className={styles.ordersGrid}>
            {orders.map((order) => {
              const productName = order.productNameAtPurchase || order.product?.name || "Product";
              const unitPrice = order.unitPriceAtPurchase || order.product?.price || order.totalPrice;
              const productImg = order.product?.productImageBase64;
              const isEligibleForCancel = ["PLACED", "CONFIRMED", "PENDING", "In Cart"].includes(order.status);

              return (
                <div key={order.id} className={styles.orderCard}>
                  <div className={styles.cardHeader}>
                    <div className={styles.refInfo}>
                      <span className={styles.orderRef}>Order #{order.id}</span>
                      <span className={styles.orderCategory}>
                        {order.product?.category || "Standard"}
                      </span>
                    </div>
                    {getStatusBadge(order.status)}
                  </div>

                  <div className={styles.cardBody}>
                    <div className={styles.thumbWrapper}>
                      {productImg ? (
                        <img
                          src={`data:image/jpeg;base64,${productImg}`}
                          alt={productName}
                        />
                      ) : (
                        <div className={styles.thumbPlaceholder}>
                          <FiPackage />
                        </div>
                      )}
                    </div>

                    <div className={styles.productDetails}>
                      <h3 className={styles.productName}>{productName}</h3>
                      <p className={styles.productDesc}>
                        {order.product?.description
                          ? order.product.description.slice(0, 70) + "..."
                          : "No description provided."}
                      </p>
                      <div className={styles.priceRow}>
                        <span className={styles.priceValue}>₹{order.totalPrice || unitPrice}</span>
                        <span className={styles.paymentMethodTag}>
                          Method: {order.paymentMethod || "COD"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.cardFooter}>
                    {isEligibleForCancel && (
                      <button
                        className={styles.cancelBtn}
                        onClick={() => handleRemoveFromOrder(order.id)}
                      >
                        <FiXCircle /> Cancel Order
                      </button>
                    )}
                    {order.product?.id && (
                      <button
                        className={styles.viewBtn}
                        onClick={() => navigate(`/products/${order.product.id}`)}
                      >
                        View Product <FiArrowRight />
                      </button>
                    )}
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

export default OrdersPage;
