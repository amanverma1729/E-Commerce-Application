import React from "react";
import { Link } from "react-router-dom";
import { FiHeart, FiShoppingBag, FiTrash2, FiArrowRight, FiLock } from "react-icons/fi";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { getRelevantProductImage } from "../utils/productImages";
import styles from "./wishlistpage.module.css";

const WishlistPage = () => {
  const { wishlist, wishlistCount, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className={styles.pageWrapper}>
        <div className={styles.emptyCard}>
          <div className={styles.emptyIcon}>
            <FiLock />
          </div>
          <h2 className={styles.emptyTitle}>Sign In to Access Your Wishlist</h2>
          <p className={styles.emptySubtitle}>
            Save your favorite items across devices and track price drops by logging into your account.
          </p>
          <Link to="/login" className="btn-primary" style={{ marginTop: "12px" }}>
            Sign In / Register <FiArrowRight />
          </Link>
        </div>
      </div>
    );
  }

  if (!wishlist || wishlist.length === 0) {
    return (
      <div className={styles.pageWrapper}>
        <div className={styles.emptyCard}>
          <div className={styles.emptyIcon}>
            <FiHeart />
          </div>
          <h2 className={styles.emptyTitle}>Your Wishlist is Empty</h2>
          <p className={styles.emptySubtitle}>
            Save items you love by tapping the heart icon on any product card!
          </p>
          <Link to="/" className="btn-primary" style={{ marginTop: "12px" }}>
            Browse Catalog <FiArrowRight />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.headerCard}>
        <div className={styles.iconBadge}>
          <FiHeart />
        </div>
        <div>
          <h1 className={styles.pageTitle}>Saved Wishlist ({wishlistCount})</h1>
          <p className={styles.pageSubtitle}>Keep track of your favorite releases and price drops</p>
        </div>
      </div>

      <div className={styles.grid}>
        {wishlist.map((product) => {
          const getImageSrc = () => getRelevantProductImage(product);

          return (
            <div key={product.id} className={styles.card}>
              <div className={styles.imageFrame}>
                <img src={getImageSrc()} alt={product.name} className={styles.image} />
                <button
                  onClick={() => removeFromWishlist(product.id)}
                  className={styles.removeBtn}
                  title="Remove from Wishlist"
                >
                  <FiTrash2 />
                </button>
              </div>

              <div className={styles.content}>
                <span className={styles.category}>{product.category || "General"}</span>
                <Link to={`/product/${product.id}`} className={styles.titleLink}>
                  <h3 className={styles.title}>{product.name}</h3>
                </Link>
                <div className={styles.priceRow}>
                  <span className={styles.price}>₹{product.price?.toLocaleString()}</span>
                  <span className={styles.strike}>₹{Math.round(product.price * 1.25).toLocaleString()}</span>
                </div>

                <button
                  onClick={() => addToCart(product.id, 1, product.name)}
                  className={styles.addToBagBtn}
                >
                  <FiShoppingBag /> Add to Bag
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WishlistPage;
