import React, { useState, useEffect } from "react";
import styles from "./addproduct.module.css";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
  FiPlusCircle,
  FiUploadCloud,
  FiTag,
  FiDollarSign,
  FiLayers,
  FiArrowLeft,
  FiImage,
  FiCheck,
} from "react-icons/fi";
import apiClient from "../api/apiClient";

const AddProduct = () => {
  const [productOwnerId, setProductOwnerId] = useState(null);
  const [product, setProduct] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "Shoes",
    size: "",
    color: "",
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedId = sessionStorage.getItem("productOwnerId") || localStorage.getItem("productOwnerId");
    if (storedId) {
      setProductOwnerId(storedId);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (e) => {
    setProduct((prev) => ({
      ...prev,
      category: e.target.value,
      size: "",
      color: "",
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!productOwnerId) {
      toast.error("Seller account not found.");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("name", product.name);
    formData.append("description", product.description);
    formData.append("price", product.price);
    formData.append("stock", product.stock);
    formData.append("category", product.category);
    formData.append("productOwnerId", productOwnerId);
    formData.append("productSizes", product.size);
    formData.append("productColors", product.color);

    const available = Number(product.stock) > 0 ? true : false;
    formData.append("available", available);

    imageFiles.forEach((file) => {
      formData.append("images", file);
    });

    try {
      await apiClient.post("/api/v1/products", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Product listed successfully!");
      navigate("/productlist");
    } catch (error) {
      console.error("Error adding product:", error);
      toast.error("Failed to list product.");
    } finally {
      setLoading(false);
    }
  };

  const options = {
    Shoes: {
      sizes: ["8", "9", "10", "11"],
      colors: ["black", "white", "blue"],
    },
    "T-shirt": {
      sizes: ["S", "M", "L", "XL", "XXL"],
      colors: [
        "white",
        "black",
        "blue",
        "orange",
        "green",
        "pink",
        "brown",
        "purple",
        "beige",
      ],
    },
    Jeans: {
      sizes: ["34", "36", "38", "40", "42", "44", "46"],
      colors: ["blue", "black", "white", "beige"],
    },
    Boots: {
      sizes: ["8", "9", "10", "11"],
      colors: ["brown", "black", "darkbrown"],
    },
    Shirts: {
      sizes: ["S", "M", "L", "XL", "XXL"],
      colors: [
        "white",
        "black",
        "blue",
        "orange",
        "green",
        "pink",
        "brown",
        "purple",
        "beige",
      ],
    },
  };

  const currentOptions = options[product.category];

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        <button onClick={() => navigate(-1)} className={styles.backButton}>
          <FiArrowLeft /> Back to Inventory
        </button>

        <div className={styles.headerRow}>
          <div className={styles.iconBadge}>
            <FiPlusCircle />
          </div>
          <div>
            <h1 className={styles.title}>List New Product</h1>
            <p className={styles.subtitle}>
              Publish authentic items directly to the Flash marketplace catalog
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className={styles.formCard}>
          <div className={styles.formSection}>
            <h3>
              <FiTag /> Basic Information
            </h3>
            <div className={styles.inputGroup}>
              <label>Product Name</label>
              <input
                type="text"
                name="name"
                placeholder="e.g. Ultra Boost Running Shoes"
                value={product.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <label>Product Description</label>
              <textarea
                name="description"
                placeholder="Describe key specs, material, and features..."
                value={product.description}
                onChange={handleChange}
                rows={4}
                className={styles.textareaInput}
                required
              />
            </div>
          </div>

          <div className={styles.formSection}>
            <h3>
              <FiDollarSign /> Pricing & Stock
            </h3>
            <div className={styles.gridTwo}>
              <div className={styles.inputGroup}>
                <label>Price (₹)</label>
                <input
                  type="number"
                  name="price"
                  placeholder="2499"
                  value={product.price}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className={styles.inputGroup}>
                <label>Inventory Stock Quantity</label>
                <input
                  type="number"
                  name="stock"
                  placeholder="50"
                  value={product.stock}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          <div className={styles.formSection}>
            <h3>
              <FiLayers /> Category & Options
            </h3>
            <div className={styles.gridThree}>
              <div className={styles.inputGroup}>
                <label>Category</label>
                <select
                  name="category"
                  value={product.category}
                  onChange={handleCategoryChange}
                  className={styles.selectInput}
                  required
                >
                  <option value="Shoes">Shoes</option>
                  <option value="T-shirt">T-shirt</option>
                  <option value="Jeans">Jeans</option>
                  <option value="Boots">Boots</option>
                  <option value="Shirts">Shirts</option>
                </select>
              </div>

              {currentOptions && (
                <div className={styles.inputGroup}>
                  <label>Available Size</label>
                  <select
                    name="size"
                    value={product.size}
                    onChange={handleChange}
                    className={styles.selectInput}
                    required
                  >
                    <option value="">Select Size</option>
                    {currentOptions.sizes.map((s, index) => (
                      <option key={index} value={s}>
                        Size {s}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {currentOptions && (
                <div className={styles.inputGroup}>
                  <label>Available Color</label>
                  <select
                    name="color"
                    value={product.color}
                    onChange={handleChange}
                    className={styles.selectInput}
                    required
                  >
                    <option value="">Select Color</option>
                    {currentOptions.colors.map((c, index) => (
                      <option key={index} value={c}>
                        {c.charAt(0).toUpperCase() + c.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          <div className={styles.formSection}>
            <h3>
              <FiImage /> Product Image Upload
            </h3>
            <div className={styles.dropZone}>
              <FiUploadCloud className={styles.uploadIcon} />
              <p>Click or drag image files to upload</p>
              <span className={styles.fileHint}>Supports JPG, PNG, WEBP</span>
              <input
                type="file"
                multiple
                onChange={handleImageChange}
                className={styles.fileInput}
              />
            </div>
            {imageFiles.length > 0 && (
              <div className={styles.selectedFiles}>
                <FiCheck className={styles.checkIcon} />
                <span>{imageFiles.length} file(s) attached for upload</span>
              </div>
            )}
          </div>

          <button type="submit" className={styles.submitButton} disabled={loading}>
            <FiPlusCircle /> {loading ? "Publishing Product..." : "Publish Product"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;
