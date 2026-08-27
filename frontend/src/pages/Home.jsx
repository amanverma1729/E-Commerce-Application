import React, { useState, useEffect } from "react";
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
  FiHeart,
  FiCheck,
  FiSliders,
  FiX,
  FiChevronDown,
  FiAlertCircle,
  FiRefreshCw,
  FiClock,
} from "react-icons/fi";
import apiClient from "../api/apiClient";

const FALLBACK_IMAGES = {
  electronics: [
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=600&q=80",
  ],
  fashion: [
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=600&q=80",
  ],
  home: [
    "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=600&q=80",
  ],
  books: [
    "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80",
  ],
  default: [
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80",
  ],
};

const getProductImageUrl = (product) => {
  if (product.productImageBase64) {
    return `data:image/jpeg;base64,${product.productImageBase64}`;
  }
  const catKey = (product.category || "default").toLowerCase();
  const list = FALLBACK_IMAGES[catKey] || FALLBACK_IMAGES.default;
  const index = Math.abs(product.id || 0) % list.length;
  return list[index];
};

const Home = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState("relevance");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);
  const [isSlowNetwork, setIsSlowNetwork] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [wishlist, setWishlist] = useState([]);
  const [addingCartId, setAddingCartId] = useState(null);

  const navigate = useNavigate();
  const userID = sessionStorage.getItem("userID") || localStorage.getItem("userID");

  const fetchProducts = (
    currentPage = 0,
    search = searchTerm,
    category = selectedCategory,
    minP = minPrice,
    maxP = maxPrice,
    sortVal = sortBy
  ) => {
    setLoading(true);
    setApiError(null);
    setIsSlowNetwork(false);

    const slowTimer = setTimeout(() => {
      setIsSlowNetwork(true);
    }, 2500);

    let sortParam = "id,desc";
    if (sortVal === "price_asc") sortParam = "price,asc";
    if (sortVal === "price_desc") sortParam = "price,desc";
    if (sortVal === "newest") sortParam = "id,desc";
    if (sortVal === "best_rated") sortParam = "stock,desc";

    let url = `/api/v1/products?page=${currentPage}&size=12&sort=${sortParam}`;
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }
    if (category && category !== "all") {
      url += `&category=${encodeURIComponent(category)}`;
    }
    if (minP) {
      url += `&minPrice=${encodeURIComponent(minP)}`;
    }
    if (maxP) {
      url += `&maxPrice=${encodeURIComponent(maxP)}`;
    }

    apiClient
      .get(url)
      .then((res) => {
        clearTimeout(slowTimer);
        const data = res.data?.data || res.data;
        if (data && data.content) {
          let content = data.content || [];
          if (minP) content = content.filter((p) => p.price >= parseFloat(minP));
          if (maxP) content = content.filter((p) => p.price <= parseFloat(maxP));
          setProducts(content);
          setTotalPages(data.totalPages || 1);
          setTotalElements(data.totalElements || content.length);
        } else if (Array.isArray(data)) {
          let content = data;
          if (search) {
            const query = search.toLowerCase();
            content = content.filter(
              (p) =>
                p.name?.toLowerCase().includes(query) ||
                p.description?.toLowerCase().includes(query) ||
                p.category?.toLowerCase().includes(query)
            );
          }
          if (category && category !== "all") {
            content = content.filter(
              (p) => p.category?.toLowerCase() === category.toLowerCase()
            );
          }
          if (minP) content = content.filter((p) => p.price >= parseFloat(minP));
          if (maxP) content = content.filter((p) => p.price <= parseFloat(maxP));

          if (sortVal === "price_asc") content.sort((a, b) => a.price - b.price);
          if (sortVal === "price_desc") content.sort((a, b) => b.price - a.price);
          if (sortVal === "best_rated") content.sort((a, b) => (b.stock || 0) - (a.stock || 0));

          setProducts(content);
          setTotalPages(1);
          setTotalElements(content.length);
        } else {
          setProducts([]);
          setTotalElements(0);
        }
        setLoading(false);
        setIsRetrying(false);
      })
      .catch((err) => {
        console.error("Error fetching products, trying fallback endpoint:", err);
        apiClient
          .get("/api/v1/products/approved")
          .then((res) => {
            clearTimeout(slowTimer);
            let legacyData = res.data?.data || res.data || [];
            if (!Array.isArray(legacyData)) legacyData = [];

            if (search) {
              const query = search.toLowerCase();
              legacyData = legacyData.filter(
                (p) =>
                  p.name?.toLowerCase().includes(query) ||
                  p.description?.toLowerCase().includes(query) ||
                  p.category?.toLowerCase().includes(query)
              );
            }
            if (category && category !== "all") {
              legacyData = legacyData.filter(
                (p) => p.category?.toLowerCase() === category.toLowerCase()
              );
            }
            if (minP) legacyData = legacyData.filter((p) => p.price >= parseFloat(minP));
            if (maxP) legacyData = legacyData.filter((p) => p.price <= parseFloat(maxP));

            if (sortVal === "price_asc") legacyData.sort((a, b) => a.price - b.price);
            if (sortVal === "price_desc") legacyData.sort((a, b) => b.price - a.price);

            setProducts(legacyData);
            setTotalElements(legacyData.length);
            setLoading(false);
            setIsRetrying(false);
          })
          .catch((fallbackErr) => {
            clearTimeout(slowTimer);
            console.error("Fallback products fetch error:", fallbackErr);
            setApiError("Failed to fetch product catalog from backend server.");
            setLoading(false);
            setIsRetrying(false);
          });
      });
  };

  useEffect(() => {
    fetchProducts(page, searchTerm, selectedCategory, minPrice, maxPrice, sortBy);
  }, [page, selectedCategory, sortBy]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    fetchProducts(0, searchTerm, selectedCategory, minPrice, maxPrice, sortBy);
  };

  const hasActiveFilters = Boolean(
    searchTerm ||
      selectedCategory !== "all" ||
      minPrice ||
      maxPrice ||
      sortBy !== "relevance"
  );

  const handleClearAllFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setMinPrice("");
    setMaxPrice("");
    setSortBy("relevance");
    setPage(0);
    fetchProducts(0, "", "all", "", "", "relevance");
  };

  const handleCardClick = (productId) => {
    if (userID) {
      navigate(`/products/${productId}`);
    } else {
      toast.error("Please log in to view product details");
      navigate("/login");
    }
  };

  const handleWishlistToggle = (e, productId) => {
    e.stopPropagation();
    if (wishlist.includes(productId)) {
      setWishlist(wishlist.filter((id) => id !== productId));
      toast("Removed from wishlist", { icon: "💔" });
    } else {
      setWishlist([...wishlist, productId]);
      toast.success("Saved to your wishlist!");
    }
  };

  const handleQuickAddToCart = async (e, product) => {
    e.stopPropagation();
    if (!userID) {
      toast.error("Please log in to add products to your cart");
      navigate("/login");
      return;
    }
    setAddingCartId(product.id);
    try {
      await apiClient.post("/api/v1/cart/items", {
        productId: product.id,
        quantity: 1,
      });
      toast.success(`${product.name} added to cart!`);
    } catch (err) {
      console.error("Error adding to cart:", err);
      try {
        const orderPayload = {
          product: { id: product.id },
          user: { id: parseInt(userID) },
          quantity: 1,
          status: "In Cart",
        };
        await apiClient.post("/api/v1/orders", orderPayload);
        toast.success(`${product.name} added to cart!`);
      } catch (legacyErr) {
        toast.error(err.response?.data?.message || "Failed to add product to cart");
      }
    } finally {
      setTimeout(() => setAddingCartId(null), 1400);
    }
  };

  const renderProductCard = (product) => {
    const isWishlisted = wishlist.includes(product.id);
    const reviewCount = 45 + ((product.id * 17) % 180);
    const ratingValue = (4.3 + ((product.id * 7) % 7) / 10).toFixed(1);
    const discountPct = 15 + ((product.id * 3) % 12);
    const originalPrice = Math.round(product.price * (1 + discountPct / 100));

    return (
      <div
        key={product.id}
        className={styles.productCard}
        onClick={() => handleCardClick(product.id)}
      >
        <div className={styles.imageContainer}>
          <img
            src={getProductImageUrl(product)}
            alt={product.name}
            className={styles.productImage}
            onError={(e) => {
              e.target.src = FALLBACK_IMAGES.default[0];
            }}
          />

          <div className={styles.badgeRow}>
            <span className={styles.categoryBadge}>{product.category || "General"}</span>
            <button
              type="button"
              className={`${styles.wishlistBtn} ${isWishlisted ? styles.wishlistActive : ""}`}
              title="Save to Wishlist"
              onClick={(e) => handleWishlistToggle(e, product.id)}
            >
              <FiHeart />
            </button>
          </div>

          <div className={styles.discountBadge}>-{discountPct}% OFF</div>

          <div className={styles.overlayActions}>
            <button
              className={styles.actionBtn}
              title="Quick View Details"
              onClick={(e) => {
                e.stopPropagation();
                handleCardClick(product.id);
              }}
            >
              <FiEye />
            </button>
          </div>
        </div>

        <div className={styles.cardContent}>
          <div className={styles.brandRow}>
            <span className={styles.brandName}>FLASH Verified</span>
            <span
              className={`${styles.stockStatus} ${
                product.stock > 0 ? styles.inStock : styles.outOfStock
              }`}
            >
              {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
            </span>
          </div>

          <h3 className={styles.productTitle}>{product.name}</h3>

          <div className={styles.ratingRow}>
            <div className={styles.stars}>
              <FiStar className={styles.starFill} />
              <FiStar className={styles.starFill} />
              <FiStar className={styles.starFill} />
              <FiStar className={styles.starFill} />
              <FiStar className={styles.starHalf} />
            </div>
            <span className={styles.ratingValue}>{ratingValue}</span>
            <span className={styles.reviewCount}>({reviewCount})</span>
          </div>

          <div className={styles.cardFooter}>
            <div className={styles.priceGroup}>
              <span className={styles.currentPrice}>₹{product.price.toLocaleString("en-IN")}</span>
              <span className={styles.originalPrice}>₹{originalPrice.toLocaleString("en-IN")}</span>
            </div>

            <button
              className={`${styles.addToCartBtn} ${
                addingCartId === product.id ? styles.addedBtnState : ""
              }`}
              title="Add to Cart"
              disabled={addingCartId === product.id}
              onClick={(e) => handleQuickAddToCart(e, product)}
            >
              {addingCartId === product.id ? (
                <>
                  <FiCheck className={styles.checkIconAnim} />
                  <span>Added</span>
                </>
              ) : (
                <>
                  <FiShoppingCart />
                  <span>Add</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderSkeletonGrid = () => (
    <div className={styles.productGrid}>
      {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
        <div key={n} className={styles.skeletonCard}>
          <div className={styles.skeletonImageContainer}>
            <div className={styles.skeletonBadgeRow}>
              <div className={styles.skeletonCategoryBadge} />
              <div className={styles.skeletonWishlistBtn} />
            </div>
            <div className={styles.skeletonDiscountBadge} />
          </div>

          <div className={styles.skeletonCardContent}>
            <div className={styles.skeletonBrandRow}>
              <div className={styles.skeletonBrandName} />
              <div className={styles.skeletonStockStatus} />
            </div>

            <div className={styles.skeletonTitleLine1} />
            <div className={styles.skeletonTitleLine2} />

            <div className={styles.skeletonRatingRow}>
              <div className={styles.skeletonStars} />
              <div className={styles.skeletonReviewCount} />
            </div>

            <div className={styles.skeletonCardFooter}>
              <div className={styles.skeletonPriceGroup}>
                <div className={styles.skeletonCurrentPrice} />
                <div className={styles.skeletonOriginalPrice} />
              </div>
              <div className={styles.skeletonAddToCartBtn} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderErrorState = () => (
    <div className={styles.errorState}>
      <div className={styles.errorIconWrapper}>
        <FiAlertCircle className={styles.errorIcon} />
      </div>
      <h3>Unable to Connect to Product Catalog</h3>
      <p>We encountered a network timeout or the server is temporarily unreachable.</p>
      <button
        className={styles.retryBtn}
        disabled={isRetrying}
        onClick={() => {
          setIsRetrying(true);
          fetchProducts(page, searchTerm, selectedCategory, minPrice, maxPrice, sortBy);
        }}
      >
        <FiRefreshCw className={`${styles.retryIcon} ${isRetrying ? styles.spinningIcon : ""}`} />
        <span>{isRetrying ? "Reconnecting..." : "Retry Connection"}</span>
      </button>
    </div>
  );

  return (
    <div className={styles.homeWrapper}>
      {/* Hero Showcase Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroGlow} />
        <div className={styles.heroInner}>
          {/* Left Column: Headline, CTAs & Metrics */}
          <div className={styles.heroLeft}>
            <div className={styles.heroBadge}>
              <FiZap className={styles.heroZap} />
              <span>FLASH SEASON SALE • UP TO 50% OFF</span>
            </div>
            <h1 className={styles.heroTitle}>
              Premium Products. <br />
              <span className={styles.heroGradientText}>Instant Delivery.</span>
            </h1>
            <p className={styles.heroSub}>
              Discover authentic electronics, fashion, and lifestyle essentials from verified sellers with instant order processing, express delivery, and buyer protection.
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

          {/* Right Column: Realistic E-Commerce Product Showcase Composition */}
          <div className={styles.heroRight}>
            <div className={styles.visualContainer}>
              {/* Main Product Showcase Card */}
              <div className={styles.mainVisualCard}>
                <img
                  src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80"
                  alt="Studio Wireless Noise-Cancelling Headphones"
                  className={styles.mainVisualImg}
                />
                <div className={styles.mainVisualOverlay}>
                  <span className={styles.visualCategory}>AUDIO & ELECTRONICS</span>
                  <h4 className={styles.visualTitle}>Studio Wireless Headphones</h4>
                  <div className={styles.visualPriceRow}>
                    <span className={styles.visualPrice}>₹14,999</span>
                    <span className={styles.visualOldPrice}>₹19,999</span>
                  </div>
                </div>
              </div>

              {/* Secondary Product Thumbnails */}
              <div className={styles.visualGrid}>
                <div className={styles.visualThumbCard}>
                  <img
                    src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80"
                    alt="Nike Air Max Sneakers"
                    className={styles.thumbImg}
                  />
                  <div className={styles.thumbInfo}>
                    <span className={styles.thumbName}>Air Max Sneakers</span>
                    <span className={styles.thumbPrice}>₹8,499</span>
                  </div>
                </div>

                <div className={styles.visualThumbCard}>
                  <img
                    src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80"
                    alt="Ultra Fit Smartwatch"
                    className={styles.thumbImg}
                  />
                  <div className={styles.thumbInfo}>
                    <span className={styles.thumbName}>Ultra Fit Watch</span>
                    <span className={styles.thumbPrice}>₹5,999</span>
                  </div>
                </div>
              </div>

              {/* Floating Glass Badges */}
              <div className={`${styles.floatingTag} ${styles.tagTopLeft}`}>
                <FiZap className={styles.tagIconZap} />
                <div>
                  <span className={styles.tagTitle}>Hot Season Deal</span>
                  <span className={styles.tagSub}>Save up to 40% OFF</span>
                </div>
              </div>

              <div className={`${styles.floatingTag} ${styles.tagBottomRight}`}>
                <FiShield className={styles.tagIconShield} />
                <div>
                  <span className={styles.tagTitle}>Buyer Protection</span>
                  <span className={styles.tagSub}>100% Genuine Certified</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Search & Catalog Section */}
      <section id="catalog-section" className={styles.catalogSection}>
        <div className={styles.sectionHeaderRow}>
          <div className={styles.sectionHeaderLeft}>
            <h2 className={styles.sectionTitle}>
              Explore <span className={styles.accentText}>Marketplace</span>
            </h2>
            <p className={styles.sectionDesc}>
              Discover authentic products with real-time price & category filters
            </p>
          </div>

          <div className={styles.resultBadge}>
            <span>{loading ? "Searching..." : `${products.length} Products Found`}</span>
          </div>
        </div>

        {/* Filter & Search Toolbar Container */}
        <div className={styles.filterToolbar}>
          {/* Top Row: Search Input & Mobile Trigger */}
          <div className={styles.searchRow}>
            <form onSubmit={handleSearchSubmit} className={styles.searchForm}>
              <FiSearch className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search by product name, description, category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
              {searchTerm && (
                <button
                  type="button"
                  className={styles.clearSearchBtn}
                  onClick={() => {
                    setSearchTerm("");
                    setPage(0);
                    fetchProducts(0, "", selectedCategory, minPrice, maxPrice, sortBy);
                  }}
                >
                  <FiX />
                </button>
              )}
              <button type="submit" className={styles.searchBtn}>Search</button>
            </form>

            <button
              type="button"
              className={styles.mobileFilterBtn}
              onClick={() => setShowMobileFilters(true)}
            >
              <FiSliders />
              <span>Filters & Sort</span>
              {hasActiveFilters && <span className={styles.filterActiveDot} />}
            </button>
          </div>

          {/* Desktop Filter Controls Bar */}
          <div className={styles.desktopControlsBar}>
            {/* Category Pills */}
            <div className={styles.categoryPills}>
              <button
                type="button"
                className={`${styles.filterChip} ${
                  selectedCategory === "all" ? styles.activeChip : ""
                }`}
                onClick={() => {
                  setSelectedCategory("all");
                  setPage(0);
                  fetchProducts(0, searchTerm, "all", minPrice, maxPrice, sortBy);
                }}
              >
                All Categories
              </button>
              {["Electronics", "Fashion", "Home", "Books"].map((cat) => (
                <button
                  type="button"
                  key={cat}
                  className={`${styles.filterChip} ${
                    selectedCategory.toLowerCase() === cat.toLowerCase()
                      ? styles.activeChip
                      : ""
                  }`}
                  onClick={() => {
                    setSelectedCategory(cat);
                    setPage(0);
                    fetchProducts(0, searchTerm, cat, minPrice, maxPrice, sortBy);
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Right Controls: Price Range & Sort By */}
            <div className={styles.rightControls}>
              {/* Price Filter Form */}
              <form
                className={styles.priceFilterForm}
                onSubmit={(e) => {
                  e.preventDefault();
                  setPage(0);
                  fetchProducts(0, searchTerm, selectedCategory, minPrice, maxPrice, sortBy);
                }}
              >
                <span className={styles.priceLabel}>Price:</span>
                <input
                  type="number"
                  placeholder="Min ₹"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className={styles.priceInput}
                />
                <span className={styles.priceDash}>-</span>
                <input
                  type="number"
                  placeholder="Max ₹"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className={styles.priceInput}
                />
                <button type="submit" className={styles.priceApplyBtn}>Apply</button>
              </form>

              {/* Sort Select */}
              <div className={styles.sortWrapper}>
                <span className={styles.sortLabel}>Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSortBy(val);
                    setPage(0);
                    fetchProducts(0, searchTerm, selectedCategory, minPrice, maxPrice, val);
                  }}
                  className={styles.sortSelect}
                >
                  <option value="relevance">Featured & Relevant</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="newest">Newest Arrivals</option>
                  <option value="best_rated">Best Rated & Stock</option>
                </select>
              </div>

              {/* Clear Filters Button */}
              {hasActiveFilters && (
                <button
                  type="button"
                  className={styles.clearAllBtn}
                  onClick={handleClearAllFilters}
                  title="Reset all filters"
                >
                  <FiRotateCcw />
                  <span>Reset</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Filter Drawer Modal */}
        {showMobileFilters && (
          <div className={styles.mobileDrawerOverlay} onClick={() => setShowMobileFilters(false)}>
            <div className={styles.mobileDrawerContent} onClick={(e) => e.stopPropagation()}>
              <div className={styles.drawerHeader}>
                <h3>Filter & Sort Products</h3>
                <button
                  type="button"
                  className={styles.closeDrawerBtn}
                  onClick={() => setShowMobileFilters(false)}
                >
                  <FiX />
                </button>
              </div>

              <div className={styles.drawerBody}>
                {/* Category Group */}
                <div className={styles.drawerGroup}>
                  <label className={styles.drawerLabel}>Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className={styles.drawerSelect}
                  >
                    <option value="all">All Categories</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Fashion">Fashion</option>
                    <option value="Home">Home</option>
                    <option value="Books">Books</option>
                  </select>
                </div>

                {/* Sort By Group */}
                <div className={styles.drawerGroup}>
                  <label className={styles.drawerLabel}>Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className={styles.drawerSelect}
                  >
                    <option value="relevance">Featured & Relevant</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="newest">Newest Arrivals</option>
                    <option value="best_rated">Best Rated & Stock</option>
                  </select>
                </div>

                {/* Price Range Group */}
                <div className={styles.drawerGroup}>
                  <label className={styles.drawerLabel}>Price Range (₹)</label>
                  <div className={styles.drawerPriceRow}>
                    <input
                      type="number"
                      placeholder="Min ₹"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className={styles.drawerInput}
                    />
                    <span>to</span>
                    <input
                      type="number"
                      placeholder="Max ₹"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className={styles.drawerInput}
                    />
                  </div>
                </div>
              </div>

              <div className={styles.drawerFooter}>
                <button
                  type="button"
                  className={styles.drawerResetBtn}
                  onClick={() => {
                    handleClearAllFilters();
                    setShowMobileFilters(false);
                  }}
                >
                  Reset All
                </button>
                <button
                  type="button"
                  className={styles.drawerApplyBtn}
                  onClick={() => {
                    setPage(0);
                    fetchProducts(0, searchTerm, selectedCategory, minPrice, maxPrice, sortBy);
                    setShowMobileFilters(false);
                  }}
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Featured Showcase Carousel */}
        {products.length > 0 && selectedCategory === "all" && !searchTerm && !minPrice && !maxPrice && (
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
          {isSlowNetwork && loading && (
            <div className={styles.slowNetworkBanner}>
              <FiClock className={styles.clockIcon} />
              <span>Network response is taking longer than usual... Loading live products.</span>
            </div>
          )}

          {loading ? (
            renderSkeletonGrid()
          ) : apiError ? (
            renderErrorState()
          ) : products.length > 0 ? (
            <>
              <div className={styles.productGrid}>
                {products.map((product) => renderProductCard(product))}
              </div>
              {totalPages > 1 && (
                <div className={styles.paginationBar}>
                  <button
                    className={styles.pageBtn}
                    disabled={page === 0}
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                  >
                    Previous
                  </button>
                  <span className={styles.pageInfo}>
                    Page {page + 1} of {totalPages}
                  </span>
                  <button
                    className={styles.pageBtn}
                    disabled={page >= totalPages - 1}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className={styles.emptyState}>
              <FiShoppingBag className={styles.emptyIcon} />
              <h3>No products found</h3>
              <p>We couldn't find any products matching your active filter criteria.</p>
              <button
                className={styles.resetBtn}
                onClick={handleClearAllFilters}
              >
                Clear All Filters
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
