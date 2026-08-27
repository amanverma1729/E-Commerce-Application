import React from "react";
import { RouterProvider } from "react-router-dom";
import { myRoutes } from "./router/router";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";

const App = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <RouterProvider router={myRoutes} />
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;
