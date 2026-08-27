import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import apiClient from "../api/apiClient";

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [addingIds, setAddingIds] = useState({});

  const isUserLoggedIn = () => {
    const token =
      localStorage.getItem("token") ||
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("token") ||
      sessionStorage.getItem("accessToken");
    const userID = sessionStorage.getItem("userID") || localStorage.getItem("userID");
    return Boolean(token && userID);
  };

  const refreshCart = useCallback(async () => {
    if (!isUserLoggedIn()) {
      setCart(null);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get("/api/v1/cart");
      const data = res.data?.data || res.data;

      if (data && Array.isArray(data.items)) {
        setCart(data);
      } else if (Array.isArray(data)) {
        setCart({ items: data, totalAmount: data.reduce((acc, i) => acc + (i.totalPrice || i.product?.price * i.quantity || 0), 0) });
      } else {
        setCart({ items: [], totalAmount: 0 });
      }
    } catch (err) {
      console.error("Cart fetch error:", err);
      // Fallback for user id endpoint if /api/v1/cart fails
      const userID = sessionStorage.getItem("userID") || localStorage.getItem("userID");
      if (userID) {
        try {
          const fallbackRes = await apiClient.get(`/api/v1/cart/user/${userID}`);
          const fallbackData = fallbackRes.data?.data || fallbackRes.data;
          if (fallbackData && Array.isArray(fallbackData.items)) {
            setCart(fallbackData);
          } else if (Array.isArray(fallbackData)) {
            setCart({ items: fallbackData, totalAmount: fallbackData.reduce((acc, i) => acc + (i.totalPrice || 0), 0) });
          } else {
            setCart({ items: [], totalAmount: 0 });
          }
        } catch (fbErr) {
          setError("Failed to load your cart. Please try again.");
        }
      } else {
        setError("Failed to load your cart.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addToCart = async (productId, quantity = 1, productName = "Product") => {
    if (!isUserLoggedIn()) {
      toast.error("Please sign in to add products to your cart");
      return false;
    }

    setAddingIds((prev) => ({ ...prev, [productId]: true }));
    try {
      const res = await apiClient.post("/api/v1/cart/items", {
        productId,
        quantity,
      });
      const data = res.data?.data || res.data;
      if (data && Array.isArray(data.items)) {
        setCart(data);
      } else {
        await refreshCart();
      }
      toast.success(`${productName} added to cart!`);
      return true;
    } catch (err) {
      console.error("Error adding item to cart:", err);
      const msg = err.response?.data?.message || "Failed to add product to cart";
      toast.error(msg);
      return false;
    } finally {
      setAddingIds((prev) => ({ ...prev, [productId]: false }));
    }
  };

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      const res = await apiClient.put(`/api/v1/cart/items/${itemId}?quantity=${newQuantity}`, {
        quantity: newQuantity,
      });
      const data = res.data?.data || res.data;
      if (data && Array.isArray(data.items)) {
        setCart(data);
      } else {
        await refreshCart();
      }
      toast.success("Cart updated");
    } catch (err) {
      console.error("Error updating cart quantity:", err);
      toast.error(err.response?.data?.message || "Failed to update quantity");
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      await apiClient.delete(`/api/v1/cart/items/${itemId}`);
      toast.success("Item removed from cart");
      await refreshCart();
    } catch (err) {
      console.error("Error removing cart item:", err);
      // Fallback for legacy order deletion endpoint
      try {
        await apiClient.delete(`/api/v1/cart/${itemId}`);
        toast.success("Item removed from cart");
        await refreshCart();
      } catch (legacyErr) {
        toast.error("Failed to remove item from cart");
      }
    }
  };

  const clearCart = async () => {
    try {
      await apiClient.delete("/api/v1/cart");
      setCart({ items: [], totalAmount: 0 });
      toast.success("Cart cleared");
    } catch (err) {
      console.error("Error clearing cart:", err);
      toast.error("Failed to clear cart");
    }
  };

  const clearCartState = () => {
    setCart(null);
    setError(null);
  };

  const cartItems = cart?.items || [];
  const cartCount = cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);
  const subtotal = cart?.totalAmount ?? cartItems.reduce((acc, item) => acc + (item.totalPrice || (item.product?.price || 0) * (item.quantity || 1)), 0);
  const grandTotal = subtotal;

  return (
    <CartContext.Provider
      value={{
        cart,
        cartItems,
        cartCount,
        subtotal,
        grandTotal,
        loading,
        error,
        addingIds,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        refreshCart,
        clearCartState,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
