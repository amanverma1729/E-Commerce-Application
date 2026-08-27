import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FiShield, 
  FiMapPin, 
  FiCreditCard, 
  FiSmartphone, 
  FiDollarSign, 
  FiCheckCircle, 
  FiLock,
  FiArrowLeft
} from "react-icons/fi";
import toast from "react-hot-toast";
import apiClient from "../api/apiClient";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import styles from "./checkoutpage.module.css";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cartItems, subtotal, clearCartState, refreshCart } = useCart();
  const { user } = useAuth();

  const [address, setAddress] = useState({
    fullName: user?.fullName || "",
    phone: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [submitting, setSubmitting] = useState(false);

  const isFreeShipping = subtotal >= 999;
  const shippingFee = isFreeShipping ? 0 : 99;
  const grandTotal = subtotal + shippingFee;

  const handleInputChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!address.street || !address.city || !address.phone) {
      toast.error("Please fill in all mandatory delivery address fields.");
      return;
    }

    setSubmitting(true);
    const fullShippingAddress = `${address.fullName}, ${address.street}, ${address.city}, ${address.state} - ${address.zipCode} (Phone: ${address.phone})`;
    const idempotencyKey = `chk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      // 1. Send checkout request to backend
      const checkoutRes = await apiClient.post(
        "/api/v1/orders/checkout",
        {
          shippingAddress: fullShippingAddress,
          paymentMethod: paymentMethod,
          idempotencyKey: idempotencyKey,
        },
        {
          headers: {
            "Idempotency-Key": idempotencyKey,
          },
        }
      );

      const orderData = checkoutRes.data?.data || checkoutRes.data;
      const orderId = orderData?.id;

      // 2. Process payment entry if not COD
      if (orderId && paymentMethod !== "COD") {
        try {
          await apiClient.post("/api/v1/payments/process", {
            orderId: orderId,
            amount: grandTotal,
            paymentMethod: paymentMethod,
            transactionId: `TXN_${Date.now()}`,
          });
        } catch (payErr) {
          console.warn("Payment recording warning:", payErr);
        }
      }

      toast.success("Order Placed Successfully! 🎉");
      clearCartState();
      await refreshCart();
      navigate("/orders");
    } catch (err) {
      console.error("Checkout failure:", err);
      toast.error(err.response?.data?.message || "Checkout failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <button onClick={() => navigate("/cart")} className={styles.backBtn}>
        <FiArrowLeft /> Back to Cart
      </button>

      <div className={styles.checkoutGrid}>
        {/* Left Column: Delivery & Payment Details */}
        <div className={styles.formColumn}>
          {/* Header */}
          <div className={styles.headerCard}>
            <div className={styles.iconBadge}>
              <FiShield />
            </div>
            <div>
              <h1 className={styles.pageTitle}>Express Checkout</h1>
              <p className={styles.pageSubtitle}>Complete your shipping and payment information</p>
            </div>
          </div>

          <form onSubmit={handlePlaceOrder} className={styles.mainForm}>
            {/* Step 1: Shipping Address */}
            <div className={styles.formSection}>
              <h2 className={styles.sectionTitle}>
                <FiMapPin className={styles.secIcon} /> 1. Shipping Address
              </h2>

              <div className={styles.formGrid}>
                <div className={styles.inputGroup}>
                  <label>Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    placeholder="Enter full name"
                    value={address.fullName}
                    onChange={handleInputChange}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label>Mobile Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    placeholder="+91 9876543210"
                    value={address.phone}
                    onChange={handleInputChange}
                  />
                </div>

                <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                  <label>Street Address / Flat / Building *</label>
                  <input
                    type="text"
                    name="street"
                    required
                    placeholder="House no, Street name, Area"
                    value={address.street}
                    onChange={handleInputChange}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label>City *</label>
                  <input
                    type="text"
                    name="city"
                    required
                    placeholder="City name"
                    value={address.city}
                    onChange={handleInputChange}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label>State *</label>
                  <input
                    type="text"
                    name="state"
                    required
                    placeholder="State"
                    value={address.state}
                    onChange={handleInputChange}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label>Pincode / ZIP *</label>
                  <input
                    type="text"
                    name="zipCode"
                    required
                    placeholder="6-digit Pincode"
                    value={address.zipCode}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Payment Method */}
            <div className={styles.formSection}>
              <h2 className={styles.sectionTitle}>
                <FiCreditCard className={styles.secIcon} /> 2. Select Payment Gateway
              </h2>

              <div className={styles.methodGrid}>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("UPI")}
                  className={`${styles.methodBtn} ${
                    paymentMethod === "UPI" ? styles.activeMethod : ""
                  }`}
                >
                  <FiSmartphone className={styles.methodIcon} />
                  <span>Instant UPI / QR</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("CREDIT_CARD")}
                  className={`${styles.methodBtn} ${
                    paymentMethod === "CREDIT_CARD" ? styles.activeMethod : ""
                  }`}
                >
                  <FiCreditCard className={styles.methodIcon} />
                  <span>Credit / Debit Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("COD")}
                  className={`${styles.methodBtn} ${
                    paymentMethod === "COD" ? styles.activeMethod : ""
                  }`}
                >
                  <FiDollarSign className={styles.methodIcon} />
                  <span>Cash on Delivery</span>
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className={styles.placeOrderBtn}
            >
              <FiCheckCircle />
              {submitting ? "Processing Order..." : `Confirm & Pay ₹${grandTotal.toLocaleString()}`}
            </button>
          </form>
        </div>

        {/* Right Column: Order Items Summary */}
        <div className={styles.summaryColumn}>
          <div className={styles.summaryCard}>
            <h2 className={styles.summaryTitle}>Review Order</h2>

            <div className={styles.itemsScrollList}>
              {cartItems.map((item) => {
                const itemProd = item.product || {};
                return (
                  <div key={item.id} className={styles.miniCard}>
                    <img
                      src={
                        itemProd.imageUrl ||
                        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&auto=format&fit=crop&q=80"
                      }
                      alt={itemProd.name}
                      className={styles.miniThumb}
                    />
                    <div className={styles.miniMeta}>
                      <p className={styles.miniTitle}>{itemProd.name || "Item"}</p>
                      <p className={styles.miniQtyPrice}>
                        {item.quantity} x ₹{(item.price || itemProd.price || 0).toLocaleString()}
                      </p>
                    </div>
                    <span className={styles.miniTotal}>
                      ₹{(item.totalPrice || (item.price || itemProd.price || 0) * item.quantity).toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className={styles.summaryBreakdown}>
              <div className={styles.row}>
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString()}</span>
              </div>
              <div className={styles.row}>
                <span>Express Shipping</span>
                <span>{shippingFee === 0 ? "FREE" : `₹${shippingFee}`}</span>
              </div>
              <div className={`${styles.row} ${styles.totalRow}`}>
                <span>Total Amount Payable</span>
                <span className={styles.totalVal}>₹{grandTotal.toLocaleString()}</span>
              </div>
            </div>

            <div className={styles.secureSeal}>
              <FiLock /> Encrypted End-to-End SSL Connection
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
