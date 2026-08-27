import React from "react";
import { Link } from "react-router-dom";
import { FiHeart, FiShoppingBag, FiStar, FiCheckCircle } from "react-icons/fi";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { getRelevantProductImage } from "../../utils/productImages";
import styles from "./productcard.module.css";

const ProductCard = ({ product }) => {
  const { addToCart, addingIds } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  if (!product) return null;

  const isSaved = isInWishlist(product.id);
  const isAdding = addingIds[product.id];

  const getImageSrc = () => getRelevantProductImage(product);

  const calculatedOriginalPrice = Math.round(product.price * 1.25);
  const discountPercent = 20;

  return (
    <div className={styles.card}>
      {/* Aspect Ratio 4:5 Frame */}
      <div className={styles.imageContainer}>
        <Link to={`/product/${product.id}`} className={styles.imageLink}>
          <img
            src={getImageSrc()}
            alt={product.name}
            className={styles.productImage}
            loading="lazy"
          />
        </Link>

        {/* Top-Right Wishlist Heart Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(product);
          }}
          className={`${styles.wishlistBtn} ${isSaved ? styles.activeWishlist : ""}`}
          title={isSaved ? "Remove from Wishlist" : "Save to Wishlist"}
          aria-label="Wishlist toggle"
        >
          <FiHeart className={styles.heartIcon} />
        </button>

        {/* Top-Left Category / Status Badge */}
        {product.approved && (
          <div className={styles.verifiedBadge}>
            <FiCheckCircle /> Verified
          </div>
        )}
      </div>

      {/* Product Content Details */}
      <div className={styles.detailsContent}>
        {/* Category & Rating Row */}
        <div className={styles.metaRow}>
          <span className={styles.categoryTag}>{product.category || "General"}</span>
          <div className={styles.ratingPill}>
            <FiStar className={styles.starIcon} /> 4.8
          </div>
        </div>

        {/* Title */}
        <Link to={`/product/${product.id}`} className={styles.titleLink}>
          <h3 className={styles.productTitle}>{product.name}</h3>
        </Link>

        {/* Price Row */}
        <div className={styles.priceRow}>
          <span className={styles.currentPrice}>₹{product.price?.toLocaleString()}</span>
          <span className={styles.originalPrice}>₹{calculatedOriginalPrice.toLocaleString()}</span>
          <span className={styles.discountBadge}>{discountPercent}% OFF</span>
        </div>

        {/* Action Button */}
        <button
          onClick={() => addToCart(product.id, 1, product.name)}
          disabled={isAdding}
          className={styles.addToCartBtn}
        >
          <FiShoppingBag />
          {isAdding ? "Adding..." : "Add to Bag"}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
