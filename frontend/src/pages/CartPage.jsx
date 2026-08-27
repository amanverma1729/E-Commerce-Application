import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  FiShoppingBag, 
  FiTrash2, 
  FiArrowRight, 
  FiShield, 
  FiTruck, 
  FiArrowLeft,
  FiZap
} from "react-icons/fi";
import { useCart } from "../context/CartContext";
import { getRelevantProductImage } from "../utils/productImages";
import styles from "./cartpage.module.css";

const CartPage = () => {
  const navigate = useNavigate();
  const { 
    cartItems, 
    cartCount, 
    subtotal, 
    grandTotal, 
    loading, 
    error, 
    updateQuantity, 
    removeFromCart, 
    clearCart 
  } = useCart();

  if (loading && cartItems.length === 0) {
    return (
      <div className={styles.loadingWrapper}>
        <div className={styles.spinner} />
        <p>Loading Cart Items...</p>
      </div>
    );
  }

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className={styles.pageWrapper}>
        <div className={styles.emptyCard}>
          <div className={styles.emptyIconBadge}>
            <FiShoppingBag />
          </div>
          <h2 className={styles.emptyTitle}>Your Bag is Empty</h2>
          <p className={styles.emptySubtitle}>
            Looks like you haven't added any products to your cart yet. Explore our latest arrivals!
          </p>
          <Link to="/" className="btn-primary" style={{ marginTop: "12px" }}>
            Explore Catalog <FiArrowRight />
          </Link>
        </div>
      </div>
    );
  }

  const freeShippingThreshold = 999;
  const amountForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const isFreeShipping = amountForFreeShipping === 0;

  return (
    <div className={styles.pageWrapper}>
      {/* Navigation Header */}
      <div className={styles.navRow}>
        <button onClick={() => navigate(-1)} className={styles.backBtn}>
          <FiArrowLeft /> Continue Shopping
        </button>
        <button onClick={clearCart} className={styles.clearBtn}>
          <FiTrash2 /> Empty Cart
        </button>
      </div>

      {/* Cart Layout Grid */}
      <div className={styles.cartGrid}>
        {/* Left Column: Items List */}
        <div className={styles.itemsColumn}>
          <div className={styles.sectionHeader}>
            <h1 className={styles.pageTitle}>Shopping Bag ({cartCount} Items)</h1>
          </div>

          {/* Free Delivery Banner */}
          <div className={styles.deliveryBanner}>
            <FiTruck className={styles.bannerIcon} />
            <div>
              {isFreeShipping ? (
                <p className={styles.bannerTextSuccess}>
                  🎉 Congratulations! You have unlocked <strong>Free Express Shipping</strong>!
                </p>
              ) : (
                <p className={styles.bannerText}>
                  Add <strong>₹{amountForFreeShipping.toLocaleString()}</strong> more to unlock <strong>Free Express Delivery</strong>.
                </p>
              )}
            </div>
          </div>

          <div className={styles.itemsList}>
            {cartItems.map((item) => {
              const itemProduct = item.product || {};
              const itemId = item.id;
              const quantity = item.quantity || 1;
              const itemPrice = item.price || itemProduct.price || 0;
              const itemTotal = item.totalPrice || itemPrice * quantity;

              const getImageSrc = () => getRelevantProductImage(itemProduct);

              return (
                <div key={itemId} className={styles.cartCard}>
                  <div className={styles.itemImageWrapper}>
                    <img
                      src={getImageSrc()}
                      alt={itemProduct.name || "Product Item"}
                    />
                  </div>

                  <div className={styles.itemMeta}>
                    <span className={styles.categoryBadge}>
                      {itemProduct.category || "General"}
                    </span>
                    <Link to={`/product/${itemProduct.id || item.productId}`} className={styles.itemTitleLink}>
                      <h3 className={styles.itemTitle}>{itemProduct.name || `Item #${item.productId}`}</h3>
                    </Link>
                    <span className={styles.itemPriceSingle}>₹{itemPrice.toLocaleString()} per unit</span>
                  </div>

                  <div className={styles.itemActions}>
                    <div className={styles.stepper}>
                      <button
                        onClick={() => updateQuantity(itemId, quantity - 1)}
                        disabled={quantity <= 1}
                      >
                        -
                      </button>
                      <span>{quantity}</span>
                      <button onClick={() => updateQuantity(itemId, quantity + 1)}>+</button>
                    </div>

                    <div className={styles.itemSubtotalBox}>
                      <span className={styles.itemTotalAmount}>₹{itemTotal.toLocaleString()}</span>
                      <button
                        onClick={() => removeFromCart(itemId)}
                        className={styles.removeBtn}
                        title="Remove item"
                      >
                        <FiTrash2 /> Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Order Summary Sidebar */}
        <div className={styles.summarySidebar}>
          <div className={styles.summaryCard}>
            <h2 className={styles.summaryTitle}>Order Summary</h2>

            <div className={styles.summaryRows}>
              <div className={styles.summaryRow}>
                <span>Subtotal ({cartCount} items)</span>
                <span className={styles.rowVal}>₹{subtotal.toLocaleString()}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Estimated Express Shipping</span>
                <span className={styles.rowVal}>
                  {isFreeShipping ? <strong style={{ color: "var(--color-success)" }}>FREE</strong> : "₹99"}
                </span>
              </div>
              <div className={styles.summaryRow}>
                <span>GST Tax & Handling</span>
                <span className={styles.rowVal}>Included</span>
              </div>
            </div>

            <div className={styles.divider} />

            <div className={styles.totalRow}>
              <span>Grand Total</span>
              <span className={styles.grandTotalVal}>
                ₹{(isFreeShipping ? subtotal : subtotal + 99).toLocaleString()}
              </span>
            </div>

            <button
              onClick={() => navigate("/checkout")}
              className={styles.checkoutBtn}
            >
              Proceed to Checkout <FiArrowRight />
            </button>

            <div className={styles.trustFooter}>
              <FiShield className={styles.trustShieldIcon} />
              <span>256-bit Bank-Grade SSL Secure Checkout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
