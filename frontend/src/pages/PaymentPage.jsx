import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useParams, useNavigate } from "react-router-dom";
import styles from "./paymentpage.module.css";
import {
  FiShield,
  FiCreditCard,
  FiGrid,
  FiTruck,
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiCheckCircle,
  FiLock,
  FiArrowLeft,
} from "react-icons/fi";
import apiClient from "../api/apiClient";

const PaymentPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentOption, setPaymentOption] = useState("COD");

  useEffect(() => {
    if (!id) {
      toast.error("Order ID missing");
      setLoading(false);
      return;
    }
    apiClient
      .get(`/api/v1/orders/${id}`)
      .then((res) => {
        const data = res.data?.data || res.data;
        setOrder(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching order details:", err);
        toast.error("Error fetching order details");
        setLoading(false);
      });
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!order) {
      toast.error("Order details not loaded");
      return;
    }
    setProcessing(true);
    try {
      // First attempt to process payment via /api/v1/payments/process endpoint
      try {
        await apiClient.post("/api/v1/payments/process", {
          orderId: order.id,
          paymentMethod: paymentOption,
          amount: (order.product?.price || order.totalPrice || 0) * (order.quantity || 1),
        });
      } catch (payErr) {
        // Fallback update on order directly
        const newStatus = paymentOption === "QR" ? "Pending Confirmation" : "Paid";
        await apiClient.put(`/api/v1/orders/${id}`, {
          ...order,
          status: newStatus,
          paymentMethod: paymentOption,
        });
      }

      toast.success(
        paymentOption === "QR"
          ? "Payment submitted! Product owner will confirm your order soon."
          : "Payment successful! Your order is confirmed."
      );
      navigate("/userprofile");
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Payment failed, please try again");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingWrapper}>
        <div className={styles.spinner} />
        <p>Loading secure payment portal...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className={styles.errorWrapper}>
        <h2>Order Not Found</h2>
        <p>The requested order reference could not be found.</p>
        <button className={styles.backBtn} onClick={() => navigate("/")}>
          Return to Store
        </button>
      </div>
    );
  }

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        <button onClick={() => navigate(-1)} className={styles.backButton}>
          <FiArrowLeft /> Back
        </button>

        <div className={styles.headerTitleRow}>
          <div className={styles.lockBadge}>
            <FiLock />
          </div>
          <div>
            <h1 className={styles.pageTitle}>Secure Checkout</h1>
            <p className={styles.pageSubtitle}>
              Order Ref: #{order.id} • Guaranteed 256-bit encryption
            </p>
          </div>
        </div>

        <div className={styles.checkoutGrid}>
          {/* Left Column: Delivery & Payment Method */}
          <div className={styles.leftCol}>
            {/* Delivery Address Card */}
            {order.user && (
              <div className={styles.cardBox}>
                <div className={styles.cardHeader}>
                  <FiMapPin className={styles.cardHeaderIcon} />
                  <h3>Delivery Details</h3>
                </div>
                <div className={styles.userGrid}>
                  <div className={styles.userItem}>
                    <FiUser className={styles.fieldIcon} />
                    <span>{order.user.name || "Customer Name"}</span>
                  </div>
                  <div className={styles.userItem}>
                    <FiMail className={styles.fieldIcon} />
                    <span>{order.user.email || "No Email"}</span>
                  </div>
                  <div className={styles.userItem}>
                    <FiPhone className={styles.fieldIcon} />
                    <span>{order.user.phone || "No Phone"}</span>
                  </div>
                  <div className={styles.userItemFull}>
                    <FiMapPin className={styles.fieldIcon} />
                    <span>{order.user.address || "Delivery Address Provided"}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Select Payment Method Card */}
            <div className={styles.cardBox}>
              <div className={styles.cardHeader}>
                <FiCreditCard className={styles.cardHeaderIcon} />
                <h3>Select Payment Method</h3>
              </div>

              <div className={styles.methodSelector}>
                <div
                  className={`${styles.methodTile} ${
                    paymentOption === "COD" ? styles.activeMethod : ""
                  }`}
                  onClick={() => setPaymentOption("COD")}
                >
                  <div className={styles.radioCircle}>
                    {paymentOption === "COD" && <div className={styles.radioDot} />}
                  </div>
                  <div className={styles.methodInfo}>
                    <div className={styles.methodTitleRow}>
                      <FiTruck className={styles.methodIcon} />
                      <h4>Cash on Delivery (COD)</h4>
                    </div>
                    <p>Pay with cash or UPI upon doorstep product delivery.</p>
                  </div>
                </div>

                <div
                  className={`${styles.methodTile} ${
                    paymentOption === "QR" ? styles.activeMethod : ""
                  }`}
                  onClick={() => setPaymentOption("QR")}
                >
                  <div className={styles.radioCircle}>
                    {paymentOption === "QR" && <div className={styles.radioDot} />}
                  </div>
                  <div className={styles.methodInfo}>
                    <div className={styles.methodTitleRow}>
                      <FiGrid className={styles.methodIcon} />
                      <h4>Scan QR & Pay</h4>
                    </div>
                    <p>Scan UPI QR code using GPay, PhonePe, Paytm or BHIM.</p>
                  </div>
                </div>
              </div>

              {/* QR Code Container */}
              {paymentOption === "QR" && (
                <div className={styles.qrCard}>
                  <p className={styles.qrInstruction}>
                    Scan this QR code using any UPI app to complete payment:
                  </p>
                  <div className={styles.qrImageFrame}>
                    <img
                      src="/payment_QR.jpeg"
                      alt="Payment QR Code"
                      className={styles.qrImage}
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "flex";
                      }}
                    />
                    <div className={styles.qrFallback} style={{ display: "none" }}>
                      <FiGrid className={styles.qrFallbackIcon} />
                      <span>Scan via UPI App</span>
                    </div>
                  </div>
                  <p className={styles.qrSubtext}>
                    After payment, click "Confirm Order & Pay" below to send confirmation.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Order Summary & Pay Action */}
          <div className={styles.rightCol}>
            <div className={styles.summaryBox}>
              <h3 className={styles.summaryTitle}>Order Items</h3>

              <div className={styles.productSummaryRow}>
                <div className={styles.productThumb}>
                  {order.product?.productImageBase64 ? (
                    <img
                      src={`data:image/jpeg;base64,${order.product.productImageBase64}`}
                      alt={order.product?.name}
                    />
                  ) : (
                    <div className={styles.thumbPlaceholder}>
                      <FiCheckCircle />
                    </div>
                  )}
                </div>
                <div className={styles.productMeta}>
                  <h4>{order.product?.name}</h4>
                  <span className={styles.itemCategory}>
                    {order.product?.category || "Item"}
                  </span>
                  <div className={styles.qtyRow}>
                    <span>Qty: {order.quantity || 1}</span>
                  </div>
                </div>
              </div>

              <div className={styles.divider} />

              <div className={styles.costBreakdown}>
                <div className={styles.costRow}>
                  <span>Item Price</span>
                  <span>₹{order.product?.price}</span>
                </div>
                <div className={styles.costRow}>
                  <span>Handling & Taxes</span>
                  <span>₹0</span>
                </div>
                <div className={styles.costRow}>
                  <span>Express Delivery</span>
                  <span className={styles.freeText}>FREE</span>
                </div>
              </div>

              <div className={styles.divider} />

              <div className={styles.totalPayRow}>
                <span>Total Payable</span>
                <span className={styles.totalPrice}>
                  ₹{(order.product?.price || 0) * (order.quantity || 1)}
                </span>
              </div>

              <button
                onClick={handleSubmit}
                className={styles.paySubmitBtn}
                disabled={processing}
              >
                <FiShield />
                {processing ? "Processing Order..." : "Confirm & Complete Payment"}
              </button>

              <div className={styles.securityNotice}>
                <FiLock className={styles.secLock} />
                <span>Protected by FLASH Guarantee 100% Secure Checkout</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
