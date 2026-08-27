import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { 
  FiZap, 
  FiGrid, 
  FiFilter, 
  FiArrowRight, 
  FiCheckCircle, 
  FiTag, 
  FiTrendingUp,
  FiSliders
} from "react-icons/fi";
import toast from "react-hot-toast";
import apiClient from "../api/apiClient";
import ProductGrid from "../components/product/ProductGrid";
import styles from "./home.module.css";

const CATEGORIES = ["All", "Electronics", "Fashion", "Home", "Footwear", "Beauty", "Sports"];

const Home = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchParam = searchParams.get("search") || "";
  const categoryParam = searchParams.get("category") || "All";

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [sortOption, setSortOption] = useState("id,desc");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  useEffect(() => {
    setSelectedCategory(categoryParam);
  }, [categoryParam]);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { size: 50 };
      if (searchParam) params.search = searchParam;
      if (selectedCategory && selectedCategory !== "All") params.category = selectedCategory;
      if (minPrice !== "" && !isNaN(parseFloat(minPrice))) params.minPrice = Math.max(0, parseFloat(minPrice));
      if (maxPrice !== "" && !isNaN(parseFloat(maxPrice))) params.maxPrice = Math.max(0, parseFloat(maxPrice));
      if (sortOption) params.sort = sortOption;

      const res = await apiClient.get("/api/v1/products", { params });
      const raw = res.data?.data || res.data;

      let list = [];
      if (Array.isArray(raw)) {
        list = raw;
      } else if (raw && Array.isArray(raw.content)) {
        list = raw.content;
      }

      setProducts(list);
    } catch (err) {
      console.error("Error loading products:", err);
      setError(
        err.response?.data?.message ||
        "Failed to connect to FLASH backend servers. Please make sure backend is running and CORS is configured."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [searchParam, selectedCategory, sortOption]);

  const handleCategorySelect = (cat) => {
    setSelectedCategory(cat);
    const newParams = new URLSearchParams(searchParams);
    if (cat === "All") {
      newParams.delete("category");
    } else {
      newParams.set("category", cat);
    }
    setSearchParams(newParams);
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    const pMin = minPrice !== "" ? parseFloat(minPrice) : null;
    const pMax = maxPrice !== "" ? parseFloat(maxPrice) : null;

    if (pMin !== null && pMin < 0) {
      toast.error("Minimum price filter cannot be negative");
      setMinPrice("0");
      return;
    }
    if (pMax !== null && pMax < 0) {
      toast.error("Maximum price filter cannot be negative");
      setMaxPrice("0");
      return;
    }
    if (pMin !== null && pMax !== null && pMin > pMax) {
      toast.error("Minimum price cannot be greater than Maximum price");
      return;
    }
    fetchProducts();
  };

  return (
    <div className={styles.pageWrapper}>
      {/* 2026 Hero Showcase Banner */}
      {!searchParam && selectedCategory === "All" && (
        <section className={styles.heroSection}>
          <div className={styles.heroGrid}>
            <div className={styles.heroTextCol}>
              <div className={styles.heroBadge}>
                <FiZap /> 2026 HYPER MARKETPLACE
              </div>
              <h1 className={styles.heroTitle}>
                High-Performance Retail Built for Speed<span className={styles.accentDot}>.</span>
              </h1>
              <p className={styles.heroSubtitle}>
                Discover thousands of verified products from top manufacturers. Real-time stock, instant checkout, and nationwide express shipping.
              </p>

              <div className={styles.heroCtaGroup}>
                <a href="#catalog" className="btn-primary">
                  Explore Catalog <FiArrowRight />
                </a>
                <Link to="/seller/register" className="btn-outline">
                  Sell on FLASH
                </Link>
              </div>

              <div className={styles.trustRow}>
                <div className={styles.trustPill}>
                  <FiCheckCircle className={styles.trustIcon} /> Verified Sellers
                </div>
                <div className={styles.trustPill}>
                  <FiTag className={styles.trustIcon} /> Direct Prices
                </div>
                <div className={styles.trustPill}>
                  <FiTrendingUp className={styles.trustIcon} /> 24h Dispatch
                </div>
              </div>
            </div>

            <div className={styles.heroVisualCol}>
              <div className={styles.featuredGlassCard}>
                <div className={styles.cardHeader}>
                  <span className={styles.featuredBadge}>FEATURED RELEASE</span>
                  <span className={styles.stockStatus}>In Stock</span>
                </div>
                <img
                  src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80"
                  alt="Featured Headphones"
                  className={styles.heroCardImage}
                />
                <div className={styles.heroCardFooter}>
                  <div>
                    <h4 className={styles.heroCardTitle}>Studio Pro Wireless ANC</h4>
                    <p className={styles.heroCardPrice}>₹4,999 <span className={styles.strike}>₹6,999</span></p>
                  </div>
                  <span className="rating-pill">4.9 ★</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Category Pills Bar */}
      <section className={styles.categoriesBar}>
        <div className={styles.categoryPills}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategorySelect(cat)}
              className={`${styles.categoryBtn} ${
                selectedCategory === cat ? styles.activeCategory : ""
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Filter & Toolbar Row */}
      <section id="catalog" className={styles.toolbarSection}>
        <div className={styles.toolbarRow}>
          <div className={styles.toolbarLeft}>
            <FiSliders className={styles.filterIcon} />
            <h2 className={styles.catalogHeading}>
              {searchParam ? `Results for "${searchParam}"` : `${selectedCategory} Collection`}
            </h2>
            <span className={styles.countBadge}>{products.length} Products</span>
          </div>

          <div className={styles.toolbarRight}>
            {/* Price Filter Drawer */}
            <form onSubmit={handleFilterSubmit} className={styles.priceFilterForm}>
              <input
                type="number"
                min="0"
                placeholder="Min ₹"
                value={minPrice}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val !== "" && parseFloat(val) < 0) return;
                  setMinPrice(val);
                }}
                className={styles.priceInput}
              />
              <span className={styles.dash}>-</span>
              <input
                type="number"
                min="0"
                placeholder="Max ₹"
                value={maxPrice}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val !== "" && parseFloat(val) < 0) return;
                  setMaxPrice(val);
                }}
                className={styles.priceInput}
              />
              <button type="submit" className={styles.applyBtn}>
                Filter
              </button>
            </form>

            {/* Sort Selector */}
            <div className={styles.sortWrapper}>
              <label htmlFor="sortSelect" className={styles.sortLabel}>Sort:</label>
              <select
                id="sortSelect"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className={styles.sortSelect}
              >
                <option value="id,desc">Newest Arrivals</option>
                <option value="price,asc">Price: Low to High</option>
                <option value="price,desc">Price: High to Low</option>
                <option value="name,asc">Name: A to Z</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Catalog Grid */}
      <section className={styles.catalogSection}>
        {error ? (
          <div className={styles.errorBox}>
            <p>{error}</p>
            <button onClick={fetchProducts} className="btn-primary" style={{ marginTop: "12px" }}>
              Retry Connection
            </button>
          </div>
        ) : (
          <ProductGrid products={products} loading={loading} />
        )}
      </section>
    </div>
  );
};

export default Home;
