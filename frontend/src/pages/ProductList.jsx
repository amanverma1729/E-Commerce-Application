import React, { useState, useEffect } from "react";
import styles from "./productList.module.css";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
  FiPlus,
  FiBox,
  FiEdit,
  FiTrash2,
  FiTruck,
  FiCheckCircle,
  FiClock,
  FiPackage,
} from "react-icons/fi";
import apiClient from "../api/apiClient";
import { getRelevantProductImage } from "../utils/productImages";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const productOwnerId = Number(sessionStorage.getItem("productOwnerId") || localStorage.getItem("productOwnerId"));
  const navigate = useNavigate();

  useEffect(() => {
    if (!productOwnerId) {
      setLoading(false);
      return;
    }
    apiClient
      .get(`/api/v1/products/owner/${productOwnerId}`)
      .then((res) => {
        const data = res.data?.data || res.data;
        setProducts(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        // Fallback fetch all and filter
        apiClient.get("/api/v1/products")
          .then((res) => {
            const data = res.data?.data?.content || res.data?.data || res.data || [];
            const ownerProducts = data.filter(
              (prod) =>
                prod.productOwner &&
                (prod.productOwner.productOwnerId || prod.productOwner.id) === productOwnerId
            );
            setProducts(ownerProducts);
          })
          .catch((e) => {
            console.error("Error fetching products:", e);
            toast.error("Error fetching products");
          });
      })
      .finally(() => {
        setLoading(false);
      });
  }, [productOwnerId]);

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      apiClient
        .delete(`/api/v1/products/${id}`)
        .then(() => {
          toast.success("Product deleted successfully");
          setProducts((prev) => prev.filter((prod) => prod.id !== id));
        })
        .catch((err) => {
          console.error("Delete error:", err);
          toast.error("Failed to delete product");
        });
    }
  };

  const handleUpdate = (id) => {
    navigate(`/updateproduct/${id}`);
  };

  const handleManageOrders = () => {
    navigate("/manageorders");
  };

  const approvedCount = products.filter((p) => p.approved).length;
  const pendingCount = products.length - approvedCount;

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.headerRow}>
          <div>
            <span className={styles.roleBadge}>SELLER CATALOG</span>
            <h1 className={styles.title}>Inventory Management</h1>
            <p className={styles.subtitle}>
              Monitor, update, and manage your products on the Flash marketplace
            </p>
          </div>

          <div className={styles.actionHeaderGroup}>
            <button
              className={styles.addButton}
              onClick={() => navigate("/addproduct")}
            >
              <FiPlus /> Add New Product
            </button>
            <button
              className={styles.manageOrdersButton}
              onClick={handleManageOrders}
            >
              <FiTruck /> Manage Orders
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className={styles.statsRow}>
          <div className={styles.statTile}>
            <FiPackage className={styles.statTileIcon} />
            <div>
              <span className={styles.statVal}>{products.length}</span>
              <span className={styles.statLbl}>Total Products</span>
            </div>
          </div>
          <div className={styles.statTileGreen}>
            <FiCheckCircle className={styles.statTileIconGreen} />
            <div>
              <span className={styles.statVal}>{approvedCount}</span>
              <span className={styles.statLbl}>Live Items</span>
            </div>
          </div>
          <div className={styles.statTileAmber}>
            <FiClock className={styles.statTileIconAmber} />
            <div>
              <span className={styles.statVal}>{pendingCount}</span>
              <span className={styles.statLbl}>Pending Approval</span>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className={styles.loadingState}>
            <div className={styles.spinner} />
            <p>Loading inventory...</p>
          </div>
        ) : products.length === 0 ? (
          <div className={styles.emptyState}>
            <FiBox className={styles.emptyIcon} />
            <h2>No Products Listed</h2>
            <p>Start selling on Flash by adding your first product catalog listing.</p>
            <button
              className={styles.addButton}
              onClick={() => navigate("/addproduct")}
              style={{ marginTop: "16px" }}
            >
              <FiPlus /> Add Product Now
            </button>
          </div>
        ) : (
          <div className={styles.tableCard}>
            <table className={styles.productTable}>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Category</th>
                  <th>Moderation</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((prod) => (
                  <tr key={prod.id}>
                    <td>
                      <div className={styles.productCell}>
                        <img
                          src={getRelevantProductImage(prod)}
                          alt={prod.name}
                          className={styles.thumbImage}
                        />
                        <span className={styles.productName}>{prod.name}</span>
                      </div>
                    </td>
                    <td className={styles.priceCell}>₹{prod.price}</td>
                    <td>
                      <span className={prod.stock > 0 ? styles.inStock : styles.outOfStock}>
                        {prod.stock} left
                      </span>
                    </td>
                    <td>
                      <span className={styles.categoryBadge}>{prod.category}</span>
                    </td>
                    <td>
                      {prod.approved ? (
                        <span className={styles.approvedBadge}>
                          <FiCheckCircle /> Approved
                        </span>
                      ) : (
                        <span className={styles.pendingBadge}>
                          <FiClock /> Pending
                        </span>
                      )}
                    </td>
                    <td>
                      <div className={styles.actionButtonsGroup}>
                        <button
                          className={styles.btnUpdate}
                          onClick={() => handleUpdate(prod.id)}
                          title="Edit Product"
                        >
                          <FiEdit /> Edit
                        </button>
                        <button
                          className={styles.btnDelete}
                          onClick={() => handleDelete(prod.id)}
                          title="Delete Product"
                        >
                          <FiTrash2 /> Delete
                        </button>
                      </div>
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

export default ProductList;
