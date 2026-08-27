import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import styles from "./productpage.module.css";
import {
  FiArrowLeft,
  FiZap,
  FiShoppingCart,
  FiShield,
  FiTruck,
  FiRotateCcw,
  FiStar,
  FiShoppingBag,
} from "react-icons/fi";
import apiClient from "../api/apiClient";
import { useCart } from "../context/CartContext";
import { getRelevantProductImage } from "../utils/productImages";

const ProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const { addToCart, addingIds } = useCart();

  const userID = sessionStorage.getItem("userID") || localStorage.getItem("userID");

  useEffect(() => {
    if (!id) {
      console.error("Product id is undefined");
      setLoading(false);
      return;
    }
    apiClient
      .get(`/api/v1/products/${id}`)
      .then((res) => {
        const data = res.data?.data || res.data;
        setProduct(data);
        if (data.productSizes && data.productSizes.length > 0) {
          setSelectedSize(data.productSizes[0]);
        }
        if (data.productColors && data.productColors.length > 0) {
          setSelectedColor(data.productColors[0]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching product:", err);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
        <p>Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className={styles.errorContainer}>
        <h2>Product Not Found</h2>
        <p>The product you are looking for may have been removed or is unavailable.</p>
        <button onClick={() => navigate("/")} className={styles.backHomeBtn}>
          Back to Store
        </button>
      </div>
    );
  }

  const handleBuy = async () => {
    if (!userID) {
      toast.error("Please log in to place an order.");
      navigate("/login");
      return;
    }
    const success = await addToCart(product.id, quantity, product.name);
    if (success) {
      navigate("/cart");
    }
  };

  const handleAddToCart = async () => {
    await addToCart(product.id, quantity, product.name);
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        <button onClick={() => navigate(-1)} className={styles.backButton}>
          <FiArrowLeft /> Back to Catalog
        </button>

        <div className={styles.productGrid}>
          {/* Left Column: Image Showcase */}
          <div className={styles.imageColumn}>
            <div className={styles.mainImageCard}>
              <img
                src={getRelevantProductImage(product)}
                alt={product.name}
                className={styles.mainImage}
              />
              <div className={styles.imageBadge}>
                {product.approved ? "VERIFIED AUTHENTIC" : "PENDING REVIEW"}
              </div>
            </div>
          </div>

          {/* Right Column: Details & Actions */}
          <div className={styles.detailsColumn}>
            <div className={styles.categoryTag}>
              {product.category || "General"}
            </div>
            <h1 className={styles.productName}>{product.name}</h1>

            <div className={styles.ratingRow}>
              <div className={styles.stars}>
                <FiStar className={styles.starFill} />
                <FiStar className={styles.starFill} />
                <FiStar className={styles.starFill} />
                <FiStar className={styles.starFill} />
                <FiStar className={styles.starHalf} />
              </div>
              <span className={styles.ratingText}>4.9 (128 Reviews)</span>
              <span className={styles.soldText}>• 500+ Sold</span>
            </div>

            <div className={styles.priceCard}>
              <div className={styles.priceRow}>
                <span className={styles.currentPrice}>₹{product.price}</span>
                <span className={styles.originalPrice}>₹{Math.round(product.price * 1.2)}</span>
                <span className={styles.savingsPill}>Save 20%</span>
              </div>
              <p className={styles.taxNotice}>Inclusive of all applicable taxes & free shipping</p>
            </div>

            <p className={styles.description}>{product.description}</p>

            {/* Size Selector */}
            {product.productSizes && product.productSizes.length > 0 && (
              <div className={styles.optionSection}>
                <label className={styles.optionLabel}>Select Size:</label>
                <div className={styles.chipRow}>
                  {product.productSizes.map((size) => (
                    <button
                      key={size}
                      className={`${styles.sizeChip} ${
                        selectedSize === size ? styles.activeChip : ""
                      }`}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color Selector */}
            {product.productColors && product.productColors.length > 0 && (
              <div className={styles.optionSection}>
                <label className={styles.optionLabel}>Available Color:</label>
                <div className={styles.chipRow}>
                  {product.productColors.map((color) => (
                    <button
                      key={color}
                      className={`${styles.colorChip} ${
                        selectedColor === color ? styles.activeChip : ""
                      }`}
                      onClick={() => setSelectedColor(color)}
                    >
                      {color.charAt(0).toUpperCase() + color.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Stepper */}
            <div className={styles.optionSection}>
              <label className={styles.optionLabel}>Quantity:</label>
              <div className={styles.quantityStepper}>
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <span>{quantity}</span>
                <button
                  onClick={() =>
                    setQuantity((q) =>
                      product.stock ? Math.min(product.stock, q + 1) : q + 1
                    )
                  }
                >
                  +
                </button>
              </div>
              <span className={styles.stockNotice}>
                {product.stock > 0
                  ? `In Stock (${product.stock} available)`
                  : "Currently Out of Stock"}
              </span>
            </div>

            {/* Action Buttons */}
            <div className={styles.actionButtons}>
              <button
                onClick={handleBuy}
                className={styles.buyButton}
                disabled={product.stock <= 0}
              >
                <FiZap /> Buy Now
              </button>
              <button
                onClick={handleAddToCart}
                className={styles.addToCartButton}
                disabled={product.stock <= 0}
              >
                <FiShoppingCart /> Add to Cart
              </button>
            </div>

            {/* Trust Features */}
            <div className={styles.trustFeatures}>
              <div className={styles.trustItem}>
                <FiTruck className={styles.trustIcon} />
                <span>Express Doorstep Delivery</span>
              </div>
              <div className={styles.trustItem}>
                <FiShield className={styles.trustIcon} />
                <span>Verified Authentic Guarantee</span>
              </div>
              <div className={styles.trustItem}>
                <FiRotateCcw className={styles.trustIcon} />
                <span>Easy 30 Days Replacement</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
