package com.ecommerce.com.ecommerce.flash.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ecommerce.com.ecommerce.flash.dto.ApiResponse;
import com.ecommerce.com.ecommerce.flash.dto.CartItemRequest;
import com.ecommerce.com.ecommerce.flash.dto.CartRequest;
import com.ecommerce.com.ecommerce.flash.dto.CartResponse;
import com.ecommerce.com.ecommerce.flash.dto.OrderResponse;
import com.ecommerce.com.ecommerce.flash.security.SecurityUtils;
import com.ecommerce.com.ecommerce.flash.security.UserPrincipal;
import com.ecommerce.com.ecommerce.flash.service.CartService;

import jakarta.validation.Valid;

@RestController
@RequestMapping({"/api/v1/cart", "/cart"})
@CrossOrigin(origins = "*")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @GetMapping
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CartResponse>> getActiveCart() {
        UserPrincipal principal = SecurityUtils.getCurrentUserPrincipal();
        CartResponse cart = cartService.getCartForUser(principal.getId());
        return ResponseEntity.ok(ApiResponse.success("Cart retrieved successfully", cart));
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Object>> getCartByUserId(@PathVariable Long userId) {
        try {
            CartResponse cart = cartService.getCartForUser(userId);
            return ResponseEntity.ok(ApiResponse.success("Cart retrieved successfully", cart));
        } catch (Exception e) {
            List<OrderResponse> legacyCartItems = cartService.getCartItemsByUser(userId);
            return ResponseEntity.ok(ApiResponse.success("Cart retrieved successfully", legacyCartItems));
        }
    }

    @PostMapping("/items")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CartResponse>> addItemToCart(@Valid @RequestBody CartItemRequest request) {
        CartResponse response = cartService.addItemToCart(request);
        return ResponseEntity.ok(ApiResponse.success("Item added to cart", response));
    }

    @PutMapping("/items/{id}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CartResponse>> updateCartItemQuantity(
            @PathVariable Long id,
            @RequestParam(required = false, defaultValue = "1") int quantity,
            @RequestBody(required = false) CartItemRequest requestBody) {
        int qtyToUpdate = (requestBody != null && requestBody.getQuantity() > 0) ? requestBody.getQuantity() : quantity;
        CartResponse response = cartService.updateCartItemQuantity(id, qtyToUpdate);
        return ResponseEntity.ok(ApiResponse.success("Cart item quantity updated", response));
    }

    @DeleteMapping("/items/{id}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> removeCartItem(@PathVariable Long id) {
        cartService.removeCartItem(id);
        return ResponseEntity.ok(ApiResponse.success("Item removed from cart", null));
    }

    @DeleteMapping
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> clearActiveCart() {
        UserPrincipal principal = SecurityUtils.getCurrentUserPrincipal();
        cartService.clearCart(principal.getId());
        return ResponseEntity.ok(ApiResponse.success("Cart cleared successfully", null));
    }

    @PostMapping
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<OrderResponse>> addToCartLegacy(@Valid @RequestBody CartRequest request) {
        OrderResponse response = cartService.addToCart(request);
        return ResponseEntity.ok(ApiResponse.success("Item added to cart", response));
    }

    @DeleteMapping("/{orderId}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> removeFromCartLegacy(@PathVariable Long orderId) {
        cartService.removeFromCart(orderId);
        return ResponseEntity.ok(ApiResponse.success("Item removed from cart", null));
    }
}
