package com.ecommerce.com.ecommerce.flash.service;

import com.ecommerce.com.ecommerce.flash.dto.CartItemRequest;
import com.ecommerce.com.ecommerce.flash.dto.CartResponse;
import com.ecommerce.com.ecommerce.flash.dto.OrderResponse;

public interface CartService {
    CartResponse getCartForUser(Long userId);
    CartResponse addItemToCart(CartItemRequest request);
    CartResponse updateCartItemQuantity(Long cartItemId, int quantity);
    void removeCartItem(Long cartItemId);
    void clearCart(Long userId);

    // Legacy backward-compatibility methods
    OrderResponse addToCart(com.ecommerce.com.ecommerce.flash.dto.CartRequest legacyRequest);
    java.util.List<OrderResponse> getCartItemsByUser(Long userId);
    void removeFromCart(Long orderId);
}
