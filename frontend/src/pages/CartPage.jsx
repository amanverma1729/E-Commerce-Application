import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import styles from "./cart.module.css";
import {
  FiShoppingCart,
  FiTrash2,
  FiZap,
  FiShoppingBag,
  FiShield,
  FiUser,
  FiPackage,
} from "react-icons/fi";
import apiClient from "../api/apiClient";

const CartPage = () => {
  const navigate = useNavigate();
  const userID = sessionStorage.getItem("userID") || localStorage.getItem("userID");
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userID) {
      toast.error("User not logged in");
      setLoading(false);
      return;
    }
    apiClient
      .get(`/api/v1/cart/user/${userID}`)
      .then((res) => {
        const data = res.data?.data || res.data;
        if (data && Array.isArray(data.items)) {
          setCartItems(data.items);
        } else if (Array.isArray(data)) {
          setCartItems(data);
        } else {
          setCartItems([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching cart items:", err);
        toast.error("Error fetching cart items");
        setLoading(false);
      });
  }, [userID]);

  const handleRemoveItem = async (orderId) => {
    try {
      await apiClient.delete(`/api/v1/cart/${orderId}`);
      toast.success("Item removed from cart");
      setCartItems(cartItems.filter((item) => item.id !== orderId));
    } catch (error) {
      console.error("Error removing item:", error);
      toast.error("Failed to remove item");
    }
  };

  const handleBuyNow = (orderId) => {
    navigate(`/payment/${orderId}`);
  };

  const subtotal = cartItems.reduce((acc, item) => acc + (item.product?.price || 0) * (item.quantity || 1), 0);
  const estTax = Math.round(subtotal * 0.05);
  const grandTotal = subtotal + estTax;

  if (loading) {
    return (
      <div className={styles.loadingWrapper}>
        <div className={styles.spinner} />
        <p>Retrieving your cart...</p>
      </div>
    );
  }

  return (
    <div className={styles.cartWrapper}>
      <div className={styles.cartContainer}>
        {/* Navigation Shortcut Header */}
        <div className={styles.navHeader}>
          <button
            className={styles.shortcutBtn}
            onClick={() => navigate("/userprofile")}
          >
            <FiUser /> Profile
          </button>
          <button
            className={styles.shortcutBtn}
            onClick={() => navigate(`/orderpage/${userID}`)}
          >
            <FiPackage /> Orders History
          </button>
        </div>

        <div className={styles.cartHeader}>
          <div className={styles.titleGroup}>
            <div className={styles.iconBadge}>
              <FiShoppingCart />
            </div>
            <div>
              <h1 className={styles.cartTitle}>Shopping Cart</h1>
              <p className={styles.cartSubtitle}>
                {cartItems.length} {cartItems.length === 1 ? "item" : "items"} in your cart
              </p>
            </div>
          </div>
        </div>

        {cartItems.length === 0 ? (
          <div className={styles.emptyCart}>
            <FiShoppingBag className={styles.emptyIcon} />
            <h2>Your cart is currently empty</h2>
            <p>Explore our trending catalog and add authentic products to your cart.</p>
            <button className={styles.shopBtn} onClick={() => navigate("/")}>
              Explore Store
            </button>
          </div>
        ) : (
          <div className={styles.cartLayout}>
            {/* Cart Items List */}
            <div className={styles.itemsList}>
              {cartItems.map((item) => (
                <div key={item.id} className={styles.cartCard}>
                  <div className={styles.itemImageWrapper}>
                    {item.product?.productImageBase64 ? (
                      <img
                        src={`data:image/jpeg;base64,${item.product.productImageBase64}`}
                        alt={item.product?.name}
                      />
                    ) : (
                      <div className={styles.placeholderImg}>
                        <FiShoppingBag />
                      </div>
                    )}
                  </div>

                  <div className={styles.itemDetails}>
                    <span className={styles.categoryBadge}>
                      {item.product?.category || "Product"}
                    </span>
                    <h3 className={styles.itemTitle}>{item.product?.name}</h3>
                    <p className={styles.itemRef}>Order Reference: #{item.id}</p>

                    <div className={styles.itemPriceRow}>
                      <span className={styles.priceValue}>₹{item.product?.price}</span>
                      <span className={styles.qtyText}>Qty: {item.quantity || 1}</span>
                    </div>
                  </div>

                  <div className={styles.itemActions}>
                    <button
                      className={styles.checkoutBtn}
                      onClick={() => handleBuyNow(item.id)}
                    >
                      <FiZap /> Checkout Item
                    </button>
                    <button
                      className={styles.removeBtn}
                      onClick={() => handleRemoveItem(item.id)}
                      title="Remove from Cart"
                    >
                      <FiTrash2 /> Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary Sidebar */}
            <div className={styles.summarySidebar}>
              <h2 className={styles.summaryTitle}>Order Summary</h2>
              
              <div className={styles.summaryRows}>
                <div className={styles.summaryRow}>
                  <span>Subtotal ({cartItems.length} items)</span>
                  <span>₹{subtotal}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span>Est. GST / Taxes (5%)</span>
                  <span>₹{estTax}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span>Shipping Standard</span>
                  <span className={styles.freeText}>FREE</span>
                </div>
              </div>

              <div className={styles.totalDivider} />

              <div className={styles.totalRow}>
                <span>Total Amount</span>
                <span className={styles.grandTotalValue}>₹{grandTotal}</span>
              </div>

              <div className={styles.trustBanner}>
                <FiShield className={styles.shieldIcon} />
                <span>Encrypted 256-Bit SSL Payment Gateway</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
