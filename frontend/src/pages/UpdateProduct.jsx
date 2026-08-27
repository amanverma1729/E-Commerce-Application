import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./updateproduct.module.css";
import apiClient from "../api/apiClient";

const categoryOptions = {
  Electronics: {
    sizes: ["Standard", "Compact", "Pro", "Ultra"],
    colors: ["black", "silver", "white", "spacegrey"],
  },
  Fashion: {
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["black", "white", "blue", "grey", "red", "brown"],
  },
  Home: {
    sizes: ["Standard", "Large", "King", "Queen"],
    colors: ["white", "grey", "beige", "black"],
  },
  Footwear: {
    sizes: ["UK 7", "UK 8", "UK 9", "UK 10", "UK 11"],
    colors: ["black", "white", "blue", "red", "grey", "brown"],
  },
  Beauty: {
    sizes: ["30ml", "50ml", "100ml", "Standard"],
    colors: ["amber", "clear", "golden", "ruby"],
  },
  Sports: {
    sizes: ["Standard", "6mm", "8mm", "Medium", "Large"],
    colors: ["black", "blue", "teal", "red", "yellow"],
  },
  Shoes: {
    sizes: ["8", "9", "10", "11"],
    colors: ["black", "white", "blue"],
  },
  "T-shirt": {
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["white", "black", "blue", "orange", "green", "pink", "brown", "purple", "beige"],
  },
  Jeans: {
    sizes: ["34", "36", "38", "40", "42", "44", "46"],
    colors: ["blue", "black", "white", "beige"],
  },
};

const UpdateProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [editProduct, setEditProduct] = useState({
    name: "",
    description: "",
    price: 0,
    stock: 0,
    category: "Electronics",
    productSizes: [],
    productColors: [],
    productImage: "",
  });

  useEffect(() => {
    async function fetchProduct() {
      try {
        const { data } = await apiClient.get(`/api/v1/products/${id}`);
        const productData = data.data || data;
        setEditProduct({
          name: productData.name || "",
          description: productData.description || "",
          price: productData.price || 0,
          stock: productData.stock || 0,
          category: productData.category || "Electronics",
          productSizes: productData.productSizes || [],
          productColors: productData.productColors || [],
          productImage: productData.productImage || "",
        });
      } catch (error) {
        toast.error("Failed to fetch product details");
      }
    }
    fetchProduct();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "price" && value !== "" && parseFloat(value) < 0) return;
    if (name === "stock" && value !== "" && parseInt(value, 10) < 0) return;
    setEditProduct({ ...editProduct, [name]: value });
  };

  const handleCategoryChange = (e) => {
    const selectedCategory = e.target.value;
    setEditProduct({
      ...editProduct,
      category: selectedCategory,
      productSizes: categoryOptions[selectedCategory]?.sizes || [],
      productColors: categoryOptions[selectedCategory]?.colors || [],
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditProduct({ ...editProduct, productImage: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (parseFloat(editProduct.price) <= 0) {
      toast.error("Price must be greater than ₹0");
      return;
    }
    if (parseInt(editProduct.stock, 10) < 0) {
      toast.error("Stock quantity cannot be negative");
      return;
    }

    try {
      await apiClient.put(`/api/v1/products/${id}`, editProduct);
      toast.success("Product updated successfully");
      navigate("/productlist");
    } catch (error) {
      toast.error("Unable to update product");
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Update Product</h1>
      <form onSubmit={handleSubmit} className={styles.form}>
        <label className={styles.label}>Name</label>
        <input
          type="text"
          name="name"
          value={editProduct.name}
          onChange={handleChange}
          className={styles.input}
          required
        />

        <label className={styles.label}>Description</label>
        <input
          type="text"
          name="description"
          value={editProduct.description}
          onChange={handleChange}
          className={styles.input}
          required
        />

        <label className={styles.label}>Price (₹)</label>
        <input
          type="number"
          name="price"
          min="0"
          step="0.01"
          value={editProduct.price}
          onChange={handleChange}
          className={styles.input}
          required
        />

        <label className={styles.label}>Stock Quantity</label>
        <input
          type="number"
          name="stock"
          min="0"
          value={editProduct.stock}
          onChange={handleChange}
          className={styles.input}
          required
        />

        <label className={styles.label}>Category</label>
        <select
          name="category"
          value={editProduct.category}
          onChange={handleCategoryChange}
          className={styles.selectInput}
        >
          {Object.keys(categoryOptions).map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <label className={styles.label}>Sizes</label>
        <input
          type="text"
          value={Array.isArray(editProduct.productSizes) ? editProduct.productSizes.join(", ") : ""}
          readOnly
          className={styles.input}
        />

        <label className={styles.label}>Colors</label>
        <input
          type="text"
          value={Array.isArray(editProduct.productColors) ? editProduct.productColors.join(", ") : ""}
          readOnly
          className={styles.input}
        />

        <label className={styles.label}>Upload Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className={styles.inputFile}
        />

        {editProduct.productImage && (
          <div className={styles.imagePreview}>
            <p>Current Image:</p>
            <img
              src={editProduct.productImage}
              alt="Product"
              className={styles.previewImage}
            />
          </div>
        )}

        <button type="submit" className={styles.button}>
          Update Product
        </button>
      </form>
    </div>
  );
};

export default UpdateProduct;
