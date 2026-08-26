import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import styles from "./admindashboard.module.css";
import {
  FiShield,
  FiUserCheck,
  FiPackage,
  FiCheckCircle,
  FiXCircle,
  FiEdit3,
  FiChevronDown,
  FiChevronUp,
  FiMail,
  FiPhone,
  FiUsers,
} from "react-icons/fi";

const AdminDashboard = () => {
  const [productOwners, setProductOwners] = useState([]);
  const [products, setProducts] = useState({});
  const [expandedOwners, setExpandedOwners] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchProductOwners = async () => {
    try {
      const { data } = await axios.get(
        "http://localhost:9090/product-owners/all"
      );
      if (Array.isArray(data)) {
        setProductOwners(data);
      } else if (data.owners) {
        setProductOwners(data.owners);
      } else {
        toast.error("Unexpected API response format.");
      }
    } catch (error) {
      console.error("Error fetching product owners:", error);
      toast.error("Error fetching seller accounts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductOwners();
  }, []);

  const fetchProductsByOwner = async (ownerId) => {
    if (products[ownerId]) {
      setExpandedOwners((prev) => ({ ...prev, [ownerId]: !prev[ownerId] }));
      return;
    }
    try {
      const { data } = await axios.get(
        `http://localhost:9090/products/owner/${ownerId}`
      );
      setProducts((prev) => ({ ...prev, [ownerId]: data }));
      setExpandedOwners((prev) => ({ ...prev, [ownerId]: true }));
    } catch (error) {
      console.error(`Error fetching products for owner ${ownerId}:`, error);
      toast.error(`Error loading products for owner ${ownerId}`);
    }
  };

  const approveProduct = async (productId) => {
    try {
      await axios.put(`http://localhost:9090/products/${productId}/approve`);
      toast.success("Product approved successfully!");
      setProducts((prev) => {
        const updatedProducts = { ...prev };
        Object.keys(updatedProducts).forEach((ownerId) => {
          updatedProducts[ownerId] = updatedProducts[ownerId].map((prod) =>
            prod.id === productId ? { ...prod, approved: true } : prod
          );
        });
        return updatedProducts;
      });
    } catch (error) {
      console.error("Error approving product:", error);
      toast.error("Failed to approve product.");
    }
  };

  const deleteProduct = async (productId) => {
    try {
      await axios.delete(`http://localhost:9090/products/${productId}`);
      toast.success("Product rejected and removed!");
      setProducts((prev) => {
        const updatedProducts = { ...prev };
        Object.keys(updatedProducts).forEach((ownerId) => {
          updatedProducts[ownerId] = updatedProducts[ownerId].filter(
            (prod) => prod.id !== productId
          );
        });
        return updatedProducts;
      });
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product.");
    }
  };

  const handleEditOwner = (ownerId) => {
    navigate(`/editowner/${ownerId}`);
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        {/* Admin Dashboard Header */}
        <div className={styles.headerBanner}>
          <div className={styles.bannerLeft}>
            <div className={styles.adminBadgeIcon}>
              <FiShield />
            </div>
            <div>
              <span className={styles.roleTag}>SYSTEM ADMINISTRATION</span>
              <h1 className={styles.title}>Seller & Product Portal</h1>
              <p className={styles.subtitle}>
                Moderate seller accounts, verify product listings, and enforce platform quality
              </p>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <FiUsers className={styles.statIcon} />
            <div>
              <span className={styles.statNumber}>{productOwners.length}</span>
              <span className={styles.statLabel}>Registered Sellers</span>
            </div>
          </div>
          <div className={styles.statCardCyan}>
            <FiPackage className={styles.statIconCyan} />
            <div>
              <span className={styles.statNumber}>Catalog</span>
              <span className={styles.statLabel}>Moderation Active</span>
            </div>
          </div>
        </div>

        {/* Seller Accounts Grid */}
        <div className={styles.sectionHeader}>
          <h2>Seller Accounts Directory</h2>
        </div>

        {loading ? (
          <div className={styles.loadingState}>
            <div className={styles.spinner} />
            <p>Loading seller accounts...</p>
          </div>
        ) : productOwners.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No seller accounts found in the database.</p>
          </div>
        ) : (
          <div className={styles.ownersGrid}>
            {productOwners.map((owner) => (
              <div key={owner.productOwnerId} className={styles.ownerCard}>
                <div className={styles.cardHeader}>
                  <div className={styles.sellerAvatar}>
                    <FiUserCheck />
                  </div>
                  <div className={styles.sellerMainInfo}>
                    <h3 className={styles.sellerName}>
                      {owner?.productOwnerName ?? "Unregistered Seller"}
                    </h3>
                    <div className={styles.sellerMeta}>
                      <span>
                        <FiMail /> {owner?.productOwnerEmail ?? "N/A"}
                      </span>
                      <span>
                        <FiPhone /> {owner?.productOwnerNumber ?? "N/A"}
                      </span>
                    </div>
                  </div>
                  <button
                    className={styles.editOwnerBtn}
                    onClick={() => handleEditOwner(owner.productOwnerId)}
                    title="Edit Seller Profile"
                  >
                    <FiEdit3 /> Edit
                  </button>
                </div>

                <div className={styles.cardActions}>
                  <button
                    className={styles.loadProductsBtn}
                    onClick={() => fetchProductsByOwner(owner.productOwnerId)}
                  >
                    <FiPackage />
                    {expandedOwners[owner.productOwnerId]
                      ? "Hide Catalog"
                      : "View Products"}
                    {expandedOwners[owner.productOwnerId] ? (
                      <FiChevronUp />
                    ) : (
                      <FiChevronDown />
                    )}
                  </button>
                </div>

                {expandedOwners[owner.productOwnerId] && (
                  <div className={styles.productDrawer}>
                    <h4 className={styles.drawerTitle}>Uploaded Inventory:</h4>
                    {products[owner.productOwnerId] ? (
                      products[owner.productOwnerId].length > 0 ? (
                        <div className={styles.productList}>
                          {products[owner.productOwnerId].map((product) => (
                            <div key={product.id} className={styles.productItem}>
                              <div className={styles.productInfo}>
                                <span className={styles.productTitle}>
                                  {product.name}
                                </span>
                                <span className={styles.productPrice}>
                                  ₹{product.price} • Stock: {product.stock}
                                </span>
                              </div>

                              <div className={styles.moderationActions}>
                                <button
                                  className={
                                    product.approved
                                      ? styles.approvedBtn
                                      : styles.approveBtn
                                  }
                                  onClick={() => approveProduct(product.id)}
                                  disabled={product.approved}
                                >
                                  <FiCheckCircle />{" "}
                                  {product.approved ? "Approved" : "Approve"}
                                </button>
                                <button
                                  className={styles.rejectBtn}
                                  onClick={() => deleteProduct(product.id)}
                                >
                                  <FiXCircle /> Reject
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className={styles.noProductsMsg}>
                          No products uploaded by this seller yet.
                        </p>
                      )
                    ) : (
                      <p className={styles.loadingMsg}>Fetching inventory...</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;

