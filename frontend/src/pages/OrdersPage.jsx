import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  FiBox, 
  FiTruck, 
  FiCheckCircle, 
  FiClock, 
  FiXCircle, 
  FiArrowRight,
  FiMapPin,
  FiCreditCard
} from "react-icons/fi";
import apiClient from "../api/apiClient";
import { useAuth } from "../context/AuthContext";
import { getRelevantProductImage } from "../utils/productImages";
import styles from "./orderspage.module.css";

const OrdersPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user || !user.id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const res = await apiClient.get(`/api/v1/orders/user/${user.id}`);
        const data = res.data?.data || res.data;
        if (Array.isArray(data)) {
          setOrders(data);
        } else {
          setOrders([]);
        }
      } catch (err) {
        console.error("Error fetching user orders:", err);
        setError("Failed to load your order history. Please check back shortly.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  if (loading) {
    return (
      <div className={styles.loadingWrapper}>
        <div className={styles.spinner} />
        <p>Retrieving Order History...</p>
      </div>
    );
  }

  if (error || orders.length === 0) {
    return (
      <div className={styles.pageWrapper}>
        <div className={styles.emptyCard}>
          <div className={styles.emptyIcon}>
            <FiBox />
          </div>
          <h2 className={styles.emptyTitle}>No Orders Yet</h2>
          <p className={styles.emptySubtitle}>
            {error || "You haven't placed any orders on FLASH yet. Start shopping now!"}
          </p>
          <Link to="/" className="btn-primary" style={{ marginTop: "12px" }}>
            Start Shopping <FiArrowRight />
          </Link>
        </div>
      </div>
    );
  }

  const renderStatusBadge = (status) => {
    const s = (status || "PLACED").toUpperCase();
    if (s === "DELIVERED") {
      return <span className={styles.badgeDelivered}><FiCheckCircle /> Delivered</span>;
    }
    if (s === "SHIPPED") {
      return <span className={styles.badgeShipped}><FiTruck /> Shipped</span>;
    }
    if (s === "CANCELLED") {
      return <span className={styles.badgeCancelled}><FiXCircle /> Cancelled</span>;
    }
    return <span className={styles.badgePlaced}><FiClock /> Order Placed</span>;
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.headerCard}>
        <div className={styles.iconBadge}>
          <FiBox />
        </div>
        <div>
          <h1 className={styles.pageTitle}>Order History</h1>
          <p className={styles.pageSubtitle}>Track shipment progress and inspect past orders</p>
        </div>
      </div>

      <div className={styles.ordersList}>
        {orders.map((order) => {
          const items = order.orderItems || order.items || [];
          const totalAmount = order.totalAmount || order.price || 0;
          const orderDate = order.orderDate ? new Date(order.orderDate).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric"
          }) : "Recent Order";

          return (
            <div key={order.id} className={styles.orderCard}>
              <div className={styles.cardHeader}>
                <div className={styles.orderMetaInfo}>
                  <span className={styles.orderId}>Order #{order.id}</span>
                  <span className={styles.orderDate}>Placed on {orderDate}</span>
                </div>

                <div className={styles.statusGroup}>
                  {renderStatusBadge(order.status)}
                </div>
              </div>

              {/* Order Timeline Visual */}
              <div className={styles.timelineStrip}>
                <div className={`${styles.timelineStep} ${styles.stepDone}`}>
                  <div className={styles.dot} />
                  <span>Placed</span>
                </div>
                <div className={`${styles.timelineStep} ${order.status !== "PLACED" ? styles.stepDone : ""}`}>
                  <div className={styles.dot} />
                  <span>Processing</span>
                </div>
                <div className={`${styles.timelineStep} ${order.status === "SHIPPED" || order.status === "DELIVERED" ? styles.stepDone : ""}`}>
                  <div className={styles.dot} />
                  <span>Shipped</span>
                </div>
                <div className={`${styles.timelineStep} ${order.status === "DELIVERED" ? styles.stepDone : ""}`}>
                  <div className={styles.dot} />
                  <span>Delivered</span>
                </div>
              </div>

              {/* Items List */}
              <div className={styles.itemsContainer}>
                {items.length > 0 ? (
                  items.map((item, idx) => {
                    const prod = item.product || {};
                    return (
                      <div key={idx} className={styles.itemRow}>
                        <img
                          src={getRelevantProductImage(prod)}
                          alt={prod.name || "Product Item"}
                          className={styles.itemThumb}
                        />
                        <div className={styles.itemMeta}>
                          <h4 className={styles.itemTitle}>{prod.name || `Product ID #${item.productId}`}</h4>
                          <span className={styles.itemQtyPrice}>
                            Qty: {item.quantity} x ₹{(item.price || prod.price || 0).toLocaleString()}
                          </span>
                        </div>
                        <span className={styles.itemSubtotal}>
                          ₹{(item.totalPrice || (item.price || prod.price || 0) * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div className={styles.itemRow}>
                    <div className={styles.itemMeta}>
                      <h4 className={styles.itemTitle}>Order Package #{order.id}</h4>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Meta */}
              <div className={styles.cardFooter}>
                <div className={styles.addressBox}>
                  <FiMapPin className={styles.metaIcon} />
                  <span className={styles.addressText}>{order.shippingAddress || "Standard Delivery Address"}</span>
                </div>
                <div className={styles.totalBox}>
                  <span className={styles.totalLabel}>Total Paid:</span>
                  <span className={styles.totalVal}>₹{totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrdersPage;
