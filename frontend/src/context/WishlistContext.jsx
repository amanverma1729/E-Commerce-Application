import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const getUserId = () => {
    try {
      return localStorage.getItem("userID") || sessionStorage.getItem("userID") || null;
    } catch (e) {
      return null;
    }
  };

  const isUserLoggedIn = useCallback(() => {
    const token =
      localStorage.getItem("token") ||
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("token") ||
      sessionStorage.getItem("accessToken");
    return Boolean(token);
  }, []);

  const [wishlist, setWishlist] = useState([]);

  // Load wishlist for current logged-in user
  const loadUserWishlist = useCallback(() => {
    const loggedIn = isUserLoggedIn();
    const userId = getUserId();

    if (loggedIn && userId) {
      try {
        const saved = localStorage.getItem(`flash_wishlist_${userId}`);
        setWishlist(saved ? JSON.parse(saved) : []);
      } catch (e) {
        setWishlist([]);
      }
    } else {
      setWishlist([]);
    }
  }, [isUserLoggedIn]);

  useEffect(() => {
    loadUserWishlist();
  }, [loadUserWishlist]);

  // Persist wishlist changes to localStorage under active user ID
  useEffect(() => {
    const loggedIn = isUserLoggedIn();
    const userId = getUserId();
    if (loggedIn && userId) {
      try {
        localStorage.setItem(`flash_wishlist_${userId}`, JSON.stringify(wishlist));
      } catch (e) {
        console.error("Failed to save wishlist:", e);
      }
    }
  }, [wishlist, isUserLoggedIn]);

  const toggleWishlist = (product) => {
    if (!isUserLoggedIn()) {
      toast.error("Please sign in to save items to your wishlist");
      return false;
    }

    if (!product || !product.id) return false;
    const exists = wishlist.some((item) => item.id === product.id);

    if (exists) {
      setWishlist((prev) => prev.filter((item) => item.id !== product.id));
      toast.success(`${product.name || "Product"} removed from Wishlist`);
    } else {
      setWishlist((prev) => [...prev, product]);
      toast.success(`${product.name || "Product"} saved to Wishlist!`);
    }
    return true;
  };

  const isInWishlist = (productId) => {
    if (!isUserLoggedIn()) return false;
    return wishlist.some((item) => item.id === productId);
  };

  const removeFromWishlist = (productId) => {
    if (!isUserLoggedIn()) {
      toast.error("Please sign in to manage your wishlist");
      return;
    }
    setWishlist((prev) => prev.filter((item) => item.id !== productId));
    toast.success("Item removed from Wishlist");
  };

  const clearWishlistState = () => {
    setWishlist([]);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist: isUserLoggedIn() ? wishlist : [],
        wishlistCount: isUserLoggedIn() ? wishlist.length : 0,
        toggleWishlist,
        isInWishlist,
        removeFromWishlist,
        clearWishlistState,
        loadUserWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
};
