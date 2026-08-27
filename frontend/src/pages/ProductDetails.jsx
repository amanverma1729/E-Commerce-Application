import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { 
  FiShoppingBag, 
  FiHeart, 
  FiArrowLeft, 
  FiStar, 
  FiTruck, 
  FiShield, 
  FiRotateCcw,
  FiZap
} from "react-icons/fi";
import apiClient from "../api/apiClient";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import styles from "./productdetails.module.css";

import { getRelevantProductImage } from "../utils/productImages";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, addingIds } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");

  useEffect(() => {
    const fetchProductDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await apiClient.get(`/api/v1/products/${id}`);
        const data = res.data?.data || res.data;
        setProduct(data);

        if (data?.productSizes?.length > 0) {
          setSelectedSize(data.productSizes[0]);
        }
        if (data?.productColors?.length > 0) {
          setSelectedColor(data.productColors[0]);
        }
      } catch (err) {
        console.error("Error fetching product details:", err);
        setError("Failed to load product details. Product may not exist or backend is offline.");
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [id]);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
        <p>Loading Product Specifications...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className={styles.errorContainer}>
        <h2>Product Not Found</h2>
        <p>{error || "Unable to locate the requested item."}</p>
        <button onClick={() => navigate("/")} className="btn-primary" style={{ marginTop: "16px" }}>
          Back to Catalog
        </button>
      </div>
    );
  }

  const isSaved = isInWishlist(product.id);
  const isAdding = addingIds[product.id];

  const getImageSrc = () => getRelevantProductImage(product);

  const calculatedOriginalPrice = Math.round(product.price * 1.25);

  const handleBuyNow = async () => {
    const success = await addToCart(product.id, quantity, product.name);
    if (success) {
      navigate("/cart");
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <button onClick={() => navigate(-1)} className={styles.backBtn}>
        <FiArrowLeft /> Back to Catalog
      </button>

      <div className={styles.detailsGrid}>
        {/* Left Column: Image Showcase */}
        <div className={styles.imageColumn}>
          <div className={styles.mainImageCard}>
            <img src={getImageSrc()} alt={product.name} className={styles.mainImage} />
            <button
              onClick={() => toggleWishlist(product)}
              className={`${styles.wishlistFloatBtn} ${isSaved ? styles.activeWishlist : ""}`}
              title="Save to Wishlist"
            >
              <FiHeart />
            </button>
          </div>
        </div>

        {/* Right Column: Specifications & CTAs */}
        <div className={styles.specsColumn}>
          <div className={styles.categoryPill}>{product.category || "General"}</div>
          <h1 className={styles.productTitle}>{product.name}</h1>

          {/* Rating & Sales Row */}
          <div className={styles.ratingRow}>
            <span className="rating-pill">4.8 ★</span>
            <span className={styles.ratingCount}>142 Reviews</span>
            <span className={styles.dotDivider}>•</span>
            <span className={styles.verifiedText}>Verified Manufacturer Item</span>
          </div>

          {/* Price Box */}
          <div className={styles.priceCard}>
            <div className={styles.priceMainRow}>
              <span className={styles.currentPrice}>₹{product.price?.toLocaleString()}</span>
              <span className={styles.originalPrice}>₹{calculatedOriginalPrice.toLocaleString()}</span>
              <span className={styles.saveBadge}>20% OFF</span>
            </div>
            <p className={styles.taxInclusiveText}>Inclusive of all taxes & nationwide shipping</p>
          </div>

          {/* Description */}
          <p className={styles.description}>
            {product.description || "High-grade performance product crafted with precision materials. Certified by FLASH quality assurance protocols for reliability and longevity."}
          </p>

          {/* Size Options (If Available) */}
          {product.productSizes && product.productSizes.length > 0 && (
            <div className={styles.optionSection}>
              <label className={styles.optionLabel}>Select Size:</label>
              <div className={styles.chipRow}>
                {product.productSizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`${styles.optionChip} ${
                      selectedSize === size ? styles.activeChip : ""
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Color Options (If Available) */}
          {product.productColors && product.productColors.length > 0 && (
            <div className={styles.optionSection}>
              <label className={styles.optionLabel}>Select Color:</label>
              <div className={styles.chipRow}>
                {product.productColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`${styles.optionChip} ${
                      selectedColor === color ? styles.activeChip : ""
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Stepper & Stock Status */}
          <div className={styles.quantitySection}>
            <label className={styles.optionLabel}>Quantity:</label>
            <div className={styles.stepperContainer}>
              <div className={styles.stepper}>
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <span>{quantity}</span>
                <button onClick={() => setQuantity((q) => q + 1)}>+</button>
              </div>

              <span className={styles.stockNotice}>
                ✓ In Stock ({product.stock ?? 25} available)
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className={styles.actionButtonsRow}>
            <button
              onClick={() => addToCart(product.id, quantity, product.name)}
              disabled={isAdding}
              className={styles.addToBagBtn}
            >
              <FiShoppingBag /> {isAdding ? "Adding..." : "Add to Bag"}
            </button>
            <button onClick={handleBuyNow} className={styles.buyNowBtn}>
              <FiZap /> Buy Now
            </button>
          </div>

          {/* Trust Guarantees */}
          <div className={styles.trustGrid}>
            <div className={styles.trustBox}>
              <FiTruck className={styles.trustIcon} />
              <div>
                <p className={styles.trustTitle}>Free Dispatch</p>
                <p className={styles.trustSub}>Ships within 24 hours</p>
              </div>
            </div>
            <div className={styles.trustBox}>
              <FiShield className={styles.trustIcon} />
              <div>
                <p className={styles.trustTitle}>100% Authentic</p>
                <p className={styles.trustSub}>Verified Supplier</p>
              </div>
            </div>
            <div className={styles.trustBox}>
              <FiRotateCcw className={styles.trustIcon} />
              <div>
                <p className={styles.trustTitle}>7-Day Guarantee</p>
                <p className={styles.trustSub}>Instant Replacement</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
