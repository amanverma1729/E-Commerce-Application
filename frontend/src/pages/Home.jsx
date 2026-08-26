import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import styles from "./home.module.css";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import {
  FiSearch,
  FiZap,
  FiShoppingBag,
  FiArrowRight,
  FiStar,
  FiShield,
  FiTruck,
  FiRotateCcw,
  FiHeadphones,
  FiEye,
  FiShoppingCart,
} from "react-icons/fi";

const Home = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const userID = sessionStorage.getItem("userID");

  useEffect(() => {
    axios
      .get("http://localhost:9090/products/approved")
      .then((res) => {
        setProducts(res.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching approved products:", err);
        setLoading(false);
      });
  }, []);

  const uniqueCategories = [
    ...new Set(
      products
        .map((p) => p.category?.trim())
        .filter(Boolean)
    ),
  ];

  // Filter products based on search term and category chip
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" ||
      p.category?.toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  const handleCardClick = (productId) => {
    if (userID) {
      navigate(`/products/${productId}`);
    } else {
      toast.error("Please log in to view product details");
      navigate("/login");
    }
  };

  const handleQuickAddToCart = async (e, product) => {
    e.stopPropagation();
    if (!userID) {
      toast.error("Please log in to add products to your cart");
      navigate("/login");
      return;
    }
    try {
      const orderPayload = {
        product: { id: product.id },
        user: { id: parseInt(userID) },
        quantity: 1,
        status: "In Cart",
      };
      await axios.post("http://localhost:9090/orders", orderPayload, {
        headers: { "Content-Type": "application/json" },
      });
      toast.success(`${product.name} added to cart!`);
    } catch (err) {
      console.error("Error adding to cart:", err);
      toast.error("Failed to add product to cart");
    }
  };

  const renderProductCard = (product) => (
    <div
      key={product.id}
      className={styles.productCard}
      onClick={() => handleCardClick(product.id)}
    >
      <div className={styles.imageContainer}>
        {product.productImageBase64 ? (
          <img
            src={`data:image/jpeg;base64,${product.productImageBase64}`}
            alt={product.name}
            className={styles.productImage}
            onError={(e) => {
              e.target.style.display = "none";
              e.target.nextSibling.style.display = "flex";
            }}
          />
        ) : null}
        <div
          className={styles.placeholderBox}
          style={{ display: product.productImageBase64 ? "none" : "flex" }}
        >
          <FiShoppingBag className={styles.placeholderIcon} />
          <span>{product.name}</span>
        </div>

        <div className={styles.badgeRow}>
          <span className={styles.categoryBadge}>{product.category || "General"}</span>
          <span className={styles.discountBadge}>-15% OFF</span>
        </div>

        <div className={styles.overlayActions}>
          <button
            className={styles.actionBtn}
            title="Quick View"
            onClick={(e) => {
              e.stopPropagation();
              handleCardClick(product.id);
            }}
          >
            <FiEye />
          </button>
          <button
            className={styles.actionBtnPrimary}
            title="Add to Cart"
            onClick={(e) => handleQuickAddToCart(e, product)}
          >
            <FiShoppingCart />
          </button>
        </div>
      </div>

      <div className={styles.cardContent}>
        <div className={styles.ratingRow}>
          <div className={styles.stars}>
            <FiStar className={styles.starFill} />
            <FiStar className={styles.starFill} />
            <FiStar className={styles.starFill} />
            <FiStar className={styles.starFill} />
            <FiStar className={styles.starHalf} />
          </div>
          <span className={styles.ratingValue}>4.8</span>
        </div>

        <h3 className={styles.productTitle}>{product.name}</h3>

        <div className={styles.cardFooter}>
          <div className={styles.priceContainer}>
            <span className={styles.currentPrice}>₹{product.price}</span>
            <span className={styles.originalPrice}>₹{Math.round(product.price * 1.18)}</span>
          </div>
          <span
            className={`${styles.stockStatus} ${
              product.stock > 0 ? styles.inStock : styles.outOfStock
            }`}
          >
            {product.stock > 0 ? `${product.stock} left` : "Out of stock"}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className={styles.homeWrapper}>
      {/* Hero Showcase Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroGlow} />
        <div className={styles.heroInner}>
          <div className={styles.heroContent}>
            <div className={styles.heroBadge}>
              <FiZap className={styles.heroZap} />
              <span>FLASH SEASON SALE • UP TO 50% OFF</span>
            </div>
            <h1 className={styles.heroTitle}>
              Next-Gen E-Commerce <br />
              <span className={styles.heroGradientText}>Real-Time Marketplace</span>
            </h1>
            <p className={styles.heroSub}>
              Discover authentic products from verified sellers with instant order processing, express delivery, and seamless checkout.
            </p>
            <div className={styles.heroActions}>
              <button
                className={styles.heroPrimaryBtn}
                onClick={() => {
                  const el = document.getElementById("catalog-section");
                  el?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                <span>Explore Catalog</span>
                <FiArrowRight />
              </button>

              {!sessionStorage.getItem("productOwnerId") && (
                <button
                  className={styles.heroSecondaryBtn}
                  onClick={() => navigate("/SignupProductOwner")}
                >
                  <span>Become a Seller</span>
                </button>
              )}
            </div>

            {/* Metrics Bar */}
            <div className={styles.metricsGrid}>
              <div className={styles.metricItem}>
                <span className={styles.metricNumber}>10K+</span>
                <span className={styles.metricLabel}>Verified Products</span>
              </div>
              <div className={styles.metricDivider} />
              <div className={styles.metricItem}>
                <span className={styles.metricNumber}>24h</span>
                <span className={styles.metricLabel}>Express Delivery</span>
              </div>
              <div className={styles.metricDivider} />
              <div className={styles.metricItem}>
                <span className={styles.metricNumber}>99.9%</span>
                <span className={styles.metricLabel}>Satisfaction Rate</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Search & Catalog Section */}
      <section id="catalog-section" className={styles.catalogSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            Discover <span className={styles.accentText}>Trending Products</span>
          </h2>
          <p className={styles.sectionDesc}>
            Filter through our curated inventory with real-time search
          </p>
        </div>

        {/* Live Search & Filter Controls */}
        <div className={styles.controlsBar}>
          <div className={styles.searchBox}>
            <FiSearch className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search products by name, description, category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                className={styles.clearSearchBtn}
                onClick={() => setSearchTerm("")}
              >
                ✕
              </button>
            )}
          </div>

          <div className={styles.categoryFilterScroll}>
            <button
              className={`${styles.filterChip} ${
                selectedCategory === "all" ? styles.activeChip : ""
              }`}
              onClick={() => setSelectedCategory("all")}
            >
              All Products ({products.length})
            </button>
            {uniqueCategories.map((cat) => (
              <button
                key={cat}
                className={`${styles.filterChip} ${
                  selectedCategory.toLowerCase() === cat.toLowerCase()
                    ? styles.activeChip
                    : ""
                }`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat} (
                {products.filter((p) => p.category?.toLowerCase() === cat.toLowerCase()).length}
                )
              </button>
            ))}
          </div>
        </div>

        {/* Featured Showcase Carousel */}
        {products.length > 0 && selectedCategory === "all" && !searchTerm && (
          <div className={styles.featuredContainer}>
            <h3 className={styles.subHeading}>
              <FiZap className={styles.zapIcon} /> Featured Hot Picks
            </h3>
            <Swiper
              modules={[Autoplay, Navigation, Pagination]}
              spaceBetween={24}
              slidesPerView={4}
              autoplay={{ delay: 2500, disableOnInteraction: false }}
              navigation={true}
              pagination={{ clickable: true }}
              breakpoints={{
                320: { slidesPerView: 1 },
                640: { slidesPerView: 2 },
                1024: { slidesPerView: 3 },
                1280: { slidesPerView: 4 },
              }}
              className={styles.swiperWrapper}
            >
              {products.slice(0, 8).map((product) => (
                <SwiperSlide key={product.id}>
                  {renderProductCard(product)}
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        )}

        {/* Filtered Grid View */}
        <div className={styles.gridContainer}>
          {loading ? (
            <div className={styles.loadingBox}>
              <div className={styles.spinner} />
              <p>Loading live products...</p>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className={styles.productGrid}>
              {filteredProducts.map((product) => renderProductCard(product))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <FiShoppingBag className={styles.emptyIcon} />
              <h3>No products found</h3>
              <p>Try searching for a different keyword or select another category filter.</p>
              <button
                className={styles.resetBtn}
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("all");
                }}
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Trust & Guarantee Banner */}
      <section className={styles.trustBanner}>
        <div className={styles.trustGrid}>
          <div className={styles.trustCard}>
            <div className={styles.trustIconWrapper}>
              <FiTruck />
            </div>
            <h4>Express Shipping</h4>
            <p>Fast doorstep delivery across all metro regions with live order status tracking.</p>
          </div>

          <div className={styles.trustCard}>
            <div className={styles.trustIconWrapper}>
              <FiShield />
            </div>
            <h4>Buyer Protection</h4>
            <p>100% genuine products sourced directly from verified authorized product owners.</p>
          </div>

          <div className={styles.trustCard}>
            <div className={styles.trustIconWrapper}>
              <FiRotateCcw />
            </div>
            <h4>Easy 30-Day Returns</h4>
            <p>Hassle-free replacement guarantee if product doesn't match your expectation.</p>
          </div>

          <div className={styles.trustCard}>
            <div className={styles.trustIconWrapper}>
              <FiHeadphones />
            </div>
            <h4>24/7 VIP Support</h4>
            <p>Dedicated customer service team standing by to assist with orders anytime.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

