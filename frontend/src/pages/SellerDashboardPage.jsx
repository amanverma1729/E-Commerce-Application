import React, { useState, useEffect } from "react";
import { 
  FiPlusSquare, 
  FiPackage, 
  FiDollarSign, 
  FiCheckCircle, 
  FiClock, 
  FiTrash2, 
  FiPlus, 
  FiZap 
} from "react-icons/fi";
import toast from "react-hot-toast";
import apiClient from "../api/apiClient";
import { useAuth } from "../context/AuthContext";
import { getRelevantProductImage } from "../utils/productImages";
import styles from "./sellerdashboard.module.css";

const SellerDashboardPage = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State for New Product Creation
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "Electronics",
    stock: "50",
    imageUrl: "",
  });

  const sellerId = user?.id || localStorage.getItem("userID") || localStorage.getItem("productOwnerId");

  const fetchSellerProducts = async () => {
    if (!sellerId) return;
    setLoading(true);
    try {
      const res = await apiClient.get(`/api/v1/products/seller/${sellerId}`);
      const data = res.data?.data || res.data;
      if (Array.isArray(data)) {
        setProducts(data);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error("Error loading seller products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellerProducts();
  }, [user, sellerId]);

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.category) {
      toast.error("Please fill in product name, price, and category.");
      return;
    }

    if (!sellerId) {
      toast.error("Seller account ID not found. Please log in again.");
      return;
    }

    setSubmitting(true);
    try {
      await apiClient.post("/api/v1/products", {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        stock: parseInt(formData.stock, 10) || 50,
        imageUrl: formData.imageUrl || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80",
        sellerId: sellerId,
        productOwnerId: sellerId,
      });

      toast.success("Product Listing Submitted for Approval! 🎉");
      setShowModal(false);
      setFormData({
        name: "",
        description: "",
        price: "",
        category: "Electronics",
        stock: "50",
        imageUrl: "",
      });
      fetchSellerProducts();
    } catch (err) {
      console.error("Product creation error:", err);
      toast.error(err.response?.data?.message || "Failed to create product.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this listing?")) return;
    try {
      await apiClient.delete(`/api/v1/products/${productId}`);
      toast.success("Listing Deleted");
      fetchSellerProducts();
    } catch (err) {
      toast.error("Failed to delete product");
    }
  };

  return (
    <div className={styles.pageWrapper}>
      {/* Header Banner */}
      <div className={styles.headerCard}>
        <div className={styles.headerLeft}>
          <div className={styles.iconBadge}>
            <FiPlusSquare />
          </div>
          <div>
            <h1 className={styles.pageTitle}>Seller Studio</h1>
            <p className={styles.pageSubtitle}>Manage your products, inventory levels, and store listings</p>
          </div>
        </div>

        <button onClick={() => setShowModal(true)} className="btn-primary">
          <FiPlus /> Add New Product
        </button>
      </div>

      {/* Analytics KPI Row */}
      <div className={styles.kpiRow}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiIcon}><FiPackage /></div>
          <div>
            <span className={styles.kpiVal}>{products.length}</span>
            <span className={styles.kpiLabel}>Total Inventory Items</span>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiIcon} style={{ color: "var(--color-success)", background: "var(--color-success-bg)" }}>
            <FiCheckCircle />
          </div>
          <div>
            <span className={styles.kpiVal}>
              {products.filter((p) => p.approved).length}
            </span>
            <span className={styles.kpiLabel}>Approved & Live Listings</span>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiIcon} style={{ color: "#d97706", background: "#fef3c7" }}>
            <FiClock />
          </div>
          <div>
            <span className={styles.kpiVal}>
              {products.filter((p) => !p.approved).length}
            </span>
            <span className={styles.kpiLabel}>Pending Admin Moderation</span>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className={styles.tableCard}>
        <h2 className={styles.tableHeading}>Active Store Catalog</h2>

        {loading ? (
          <div className={styles.loadingBox}>Loading catalog items...</div>
        ) : products.length === 0 ? (
          <div className={styles.emptyBox}>
            <FiPackage className={styles.emptyIcon} />
            <p>No product listings found in your seller account.</p>
            <button onClick={() => setShowModal(true)} className="btn-primary" style={{ marginTop: "12px" }}>
              Publish Your First Product
            </button>
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div className={styles.productCell}>
                        <img
                          src={getRelevantProductImage(p)}
                          alt={p.name}
                          className={styles.productThumb}
                        />
                        <span className={styles.productName}>{p.name}</span>
                      </div>
                    </td>
                    <td><span className={styles.catTag}>{p.category}</span></td>
                    <td><strong>₹{p.price?.toLocaleString()}</strong></td>
                    <td>{p.stock ?? 50} units</td>
                    <td>
                      {p.approved ? (
                        <span className={styles.approvedPill}><FiCheckCircle /> Live</span>
                      ) : (
                        <span className={styles.pendingPill}><FiClock /> Moderation</span>
                      )}
                    </td>
                    <td>
                      <button
                        onClick={() => handleDeleteProduct(p.id)}
                        className={styles.deleteBtn}
                        title="Delete listing"
                      >
                        <FiTrash2 />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New Product Modal */}
      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalCard}>
            <div className={styles.modalHeader}>
              <h2>Add Product to Catalog</h2>
              <button onClick={() => setShowModal(false)} className={styles.closeBtn}>✕</button>
            </div>

            <form onSubmit={handleCreateProduct} className={styles.modalForm}>
              <div className={styles.inputGroup}>
                <label>Product Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Wireless Noise-Canceling Earbuds"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className={styles.inputRow}>
                <div className={styles.inputGroup}>
                  <label>Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="Electronics">Electronics</option>
                    <option value="Fashion">Fashion</option>
                    <option value="Home">Home</option>
                    <option value="Footwear">Footwear</option>
                    <option value="Beauty">Beauty</option>
                    <option value="Sports">Sports</option>
                  </select>
                </div>

                <div className={styles.inputGroup}>
                  <label>Price (₹) *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    placeholder="2499"
                    value={formData.price}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val !== "" && parseFloat(val) < 0) return;
                      setFormData({ ...formData, price: val });
                    }}
                  />
                </div>
              </div>

              <div className={styles.inputRow}>
                <div className={styles.inputGroup}>
                  <label>Initial Stock Quantity</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="50"
                    value={formData.stock}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val !== "" && parseInt(val, 10) < 0) return;
                      setFormData({ ...formData, stock: val });
                    }}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label>Image URL</label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  />
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label>Product Description</label>
                <textarea
                  rows="3"
                  placeholder="Describe features, specs, and materials..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className={styles.modalCtaRow}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary"
                >
                  {submitting ? "Publishing..." : "Submit Listing"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerDashboardPage;
