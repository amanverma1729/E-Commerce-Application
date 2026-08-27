import React, { useState, useEffect } from "react";
import { 
  FiShield, 
  FiPackage, 
  FiCheckCircle, 
  FiXCircle, 
  FiClock, 
  FiAlertCircle, 
  FiZap 
} from "react-icons/fi";
import toast from "react-hot-toast";
import apiClient from "../api/apiClient";
import styles from "./admindashboard.module.css";

const AdminDashboardPage = () => {
  const [unapprovedProducts, setUnapprovedProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Unapproved Products
      const unapprovedRes = await apiClient.get("/api/v1/admin/unapproved-products");
      const unapprovedData = unapprovedRes.data?.data || unapprovedRes.data;
      if (Array.isArray(unapprovedData)) {
        setUnapprovedProducts(unapprovedData);
      } else {
        setUnapprovedProducts([]);
      }

      // 2. Fetch All Products
      const allRes = await apiClient.get("/api/v1/products");
      const allData = allRes.data?.data || allRes.data;
      const list = Array.isArray(allData) ? allData : Array.isArray(allData?.content) ? allData.content : [];
      setAllProducts(list);
    } catch (err) {
      console.error("Admin fetch error:", err);
      toast.error("Failed to load admin moderation queue.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = async (productId) => {
    try {
      await apiClient.post(`/api/v1/admin/approve-product/${productId}`);
      toast.success("Product Approved & Published Live! 🎉");
      fetchData();
    } catch (err) {
      toast.error("Failed to approve product.");
    }
  };

  const handleReject = async (productId) => {
    if (!window.confirm("Are you sure you want to reject this product listing?")) return;
    try {
      await apiClient.post(`/api/v1/admin/reject-product/${productId}`);
      toast.success("Product Listing Rejected");
      fetchData();
    } catch (err) {
      toast.error("Failed to reject product.");
    }
  };

  return (
    <div className={styles.pageWrapper}>
      {/* Header Banner */}
      <div className={styles.headerCard}>
        <div className={styles.iconBadge}>
          <FiShield />
        </div>
        <div>
          <h1 className={styles.pageTitle}>Admin Moderation Portal</h1>
          <p className={styles.pageSubtitle}>Review merchant submissions, verify product compliance, and moderate catalog listings</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className={styles.kpiRow}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiIcon} style={{ color: "#d97706", background: "#fef3c7" }}>
            <FiClock />
          </div>
          <div>
            <span className={styles.kpiVal}>{unapprovedProducts.length}</span>
            <span className={styles.kpiLabel}>Pending Approvals</span>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiIcon} style={{ color: "var(--color-success)", background: "var(--color-success-bg)" }}>
            <FiCheckCircle />
          </div>
          <div>
            <span className={styles.kpiVal}>{allProducts.length}</span>
            <span className={styles.kpiLabel}>Total Live Catalog Items</span>
          </div>
        </div>
      </div>

      {/* Tab Controls */}
      <div className={styles.tabBar}>
        <button
          onClick={() => setActiveTab("pending")}
          className={`${styles.tabBtn} ${activeTab === "pending" ? styles.activeTab : ""}`}
        >
          Pending Approvals ({unapprovedProducts.length})
        </button>
        <button
          onClick={() => setActiveTab("all")}
          className={`${styles.tabBtn} ${activeTab === "all" ? styles.activeTab : ""}`}
        >
          All Catalog Products ({allProducts.length})
        </button>
      </div>

      {/* Content Table */}
      <div className={styles.tableCard}>
        {loading ? (
          <div className={styles.loadingBox}>Loading moderation queue...</div>
        ) : activeTab === "pending" ? (
          unapprovedProducts.length === 0 ? (
            <div className={styles.emptyBox}>
              <FiCheckCircle className={styles.emptyIcon} />
              <h3>All Queue Items Moderated</h3>
              <p>There are no pending product submissions waiting for admin approval.</p>
            </div>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Seller ID</th>
                    <th>Moderation Action</th>
                  </tr>
                </thead>
                <tbody>
                  {unapprovedProducts.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <div className={styles.productCell}>
                          <img
                            src={p.imageUrl || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&auto=format&fit=crop&q=80"}
                            alt={p.name}
                            className={styles.productThumb}
                          />
                          <div>
                            <span className={styles.productName}>{p.name}</span>
                            <p className={styles.productDesc}>{p.description?.slice(0, 50)}...</p>
                          </div>
                        </div>
                      </td>
                      <td><span className={styles.catTag}>{p.category}</span></td>
                      <td><strong>₹{p.price?.toLocaleString()}</strong></td>
                      <td>Seller #{p.sellerId || "Direct"}</td>
                      <td>
                        <div className={styles.actionGroup}>
                          <button
                            onClick={() => handleApprove(p.id)}
                            className={styles.approveBtn}
                          >
                            <FiCheckCircle /> Approve
                          </button>
                          <button
                            onClick={() => handleReject(p.id)}
                            className={styles.rejectBtn}
                          >
                            <FiXCircle /> Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
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
                </tr>
              </thead>
              <tbody>
                {allProducts.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div className={styles.productCell}>
                        <img
                          src={p.imageUrl || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&auto=format&fit=crop&q=80"}
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
                        <span className={styles.approvedPill}><FiCheckCircle /> Approved</span>
                      ) : (
                        <span className={styles.pendingPill}><FiClock /> Pending</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardPage;
