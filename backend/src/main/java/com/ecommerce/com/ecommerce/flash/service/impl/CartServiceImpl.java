package com.ecommerce.com.ecommerce.flash.service.impl;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ecommerce.com.ecommerce.flash.dto.CartItemRequest;
import com.ecommerce.com.ecommerce.flash.dto.CartItemResponse;
import com.ecommerce.com.ecommerce.flash.dto.CartResponse;
import com.ecommerce.com.ecommerce.flash.dto.OrderResponse;
import com.ecommerce.com.ecommerce.flash.dto.ProductOwnerResponse;
import com.ecommerce.com.ecommerce.flash.dto.ProductResponse;
import com.ecommerce.com.ecommerce.flash.entity.Cart;
import com.ecommerce.com.ecommerce.flash.entity.CartItem;
import com.ecommerce.com.ecommerce.flash.entity.Product;
import com.ecommerce.com.ecommerce.flash.entity.ProductOwner;
import com.ecommerce.com.ecommerce.flash.entity.ProductStatus;
import com.ecommerce.com.ecommerce.flash.entity.User;
import com.ecommerce.com.ecommerce.flash.exception.BadRequestException;
import com.ecommerce.com.ecommerce.flash.exception.ResourceNotFoundException;
import com.ecommerce.com.ecommerce.flash.exception.UnauthorizedException;
import com.ecommerce.com.ecommerce.flash.repository.CartItemRepository;
import com.ecommerce.com.ecommerce.flash.repository.CartRepository;
import com.ecommerce.com.ecommerce.flash.repository.OrderRepository;
import com.ecommerce.com.ecommerce.flash.repository.ProductRepository;
import com.ecommerce.com.ecommerce.flash.repository.UserRepository;
import com.ecommerce.com.ecommerce.flash.security.SecurityUtils;
import com.ecommerce.com.ecommerce.flash.security.UserPrincipal;
import com.ecommerce.com.ecommerce.flash.service.CartService;

@Service
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;

    public CartServiceImpl(CartRepository cartRepository,
                           CartItemRepository cartItemRepository,
                           ProductRepository productRepository,
                           UserRepository userRepository,
                           OrderRepository orderRepository) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.orderRepository = orderRepository;
    }

    private User getAuthenticatedUser() {
        UserPrincipal principal = SecurityUtils.getCurrentUserPrincipal();
        if (principal == null) {
            throw new UnauthorizedException("Authentication required to access cart.");
        }
        return userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found."));
    }

    private Cart getOrCreateUserCart(User user) {
        return cartRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    Cart newCart = new Cart();
                    newCart.setUser(user);
                    return cartRepository.save(newCart);
                });
    }

    @Override
    @Transactional(readOnly = true)
    public CartResponse getCartForUser(Long userId) {
        if (!SecurityUtils.isOwnerOrAdmin(userId)) {
            throw new UnauthorizedException("Access denied: Cannot access another user's cart.");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));
        Cart cart = getOrCreateUserCart(user);
        return mapToCartResponse(cart);
    }

    @Override
    @Transactional
    public CartResponse addItemToCart(CartItemRequest request) {
        User user = getAuthenticatedUser();

        if (request.getQuantity() <= 0) {
            throw new BadRequestException("Quantity must be greater than zero.");
        }

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + request.getProductId()));

        if (!product.isApproved() || !product.isAvailable() || product.getStatus() != ProductStatus.APPROVED) {
            throw new BadRequestException("Product is not available for purchase.");
        }

        Cart cart = getOrCreateUserCart(user);

        Optional<CartItem> existingItemOpt = cartItemRepository.findByCartIdAndProductId(cart.getId(), product.getId());
        if (existingItemOpt.isPresent()) {
            CartItem existingItem = existingItemOpt.get();
            existingItem.setQuantity(existingItem.getQuantity() + request.getQuantity());
            cartItemRepository.save(existingItem);
        } else {
            CartItem newItem = new CartItem();
            newItem.setCart(cart);
            newItem.setProduct(product);
            newItem.setQuantity(request.getQuantity());
            cart.getCartItems().add(newItem);
            cartItemRepository.save(newItem);
        }

        Cart updatedCart = cartRepository.save(cart);
        return mapToCartResponse(updatedCart);
    }

    @Override
    @Transactional
    public CartResponse updateCartItemQuantity(Long cartItemId, int quantity) {
        User user = getAuthenticatedUser();

        if (quantity <= 0) {
            throw new BadRequestException("Quantity must be greater than zero.");
        }

        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found with ID: " + cartItemId));

        if (!cartItem.getCart().getUser().getId().equals(user.getId()) && !SecurityUtils.isAdmin()) {
            throw new UnauthorizedException("Access denied: Cannot modify another user's cart item.");
        }

        cartItem.setQuantity(quantity);
        cartItemRepository.save(cartItem);

        return mapToCartResponse(cartItem.getCart());
    }

    @Override
    @Transactional
    public void removeCartItem(Long cartItemId) {
        User user = getAuthenticatedUser();

        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found with ID: " + cartItemId));

        if (!cartItem.getCart().getUser().getId().equals(user.getId()) && !SecurityUtils.isAdmin()) {
            throw new UnauthorizedException("Access denied: Cannot delete another user's cart item.");
        }

        Cart cart = cartItem.getCart();
        cart.getCartItems().remove(cartItem);
        cartItemRepository.delete(cartItem);
        cartRepository.save(cart);
    }

    @Override
    @Transactional
    public void clearCart(Long userId) {
        if (!SecurityUtils.isOwnerOrAdmin(userId)) {
            throw new UnauthorizedException("Access denied: Cannot clear another user's cart.");
        }
        Optional<Cart> cartOpt = cartRepository.findByUserId(userId);
        if (cartOpt.isPresent()) {
            Cart cart = cartOpt.get();
            cart.getCartItems().clear();
            cartRepository.save(cart);
        }
    }

    private CartResponse mapToCartResponse(Cart cart) {
        List<CartItemResponse> itemResponses = cart.getCartItems() != null ?
                cart.getCartItems().stream().map(this::mapToCartItemResponse).collect(Collectors.toList()) :
                Collections.emptyList();

        double total = itemResponses.stream().mapToDouble(CartItemResponse::getTotalPrice).sum();

        return CartResponse.builder()
                .id(cart.getId())
                .userId(cart.getUser() != null ? cart.getUser().getId() : null)
                .items(itemResponses)
                .totalAmount(total)
                .build();
    }

    private CartItemResponse mapToCartItemResponse(CartItem item) {
        Product p = item.getProduct();
        ProductOwnerResponse ownerResp = null;
        if (p.getProductOwner() != null) {
            ProductOwner po = p.getProductOwner();
            ownerResp = ProductOwnerResponse.builder()
                    .productOwnerId(po.getProductOwnerId())
                    .productOwnerName(po.getProductOwnerName())
                    .productOwnerEmail(po.getProductOwnerEmail())
                    .productOwnerNumber(po.getProductOwnerNumber())
                    .build();
        }

        String imgBase64 = null;
        if (p.getProductImage() != null) {
            imgBase64 = java.util.Base64.getEncoder().encodeToString(p.getProductImage());
        }

        ProductResponse productResp = ProductResponse.builder()
                .id(p.getId())
                .name(p.getName())
                .description(p.getDescription())
                .price(p.getPrice())
                .stock(p.getStock())
                .category(p.getCategory())
                .available(p.isAvailable())
                .approved(p.isApproved())
                .status(p.getStatus() != null ? p.getStatus().name() : "PENDING")
                .productImageBase64(imgBase64)
                .productOwner(ownerResp)
                .build();

        double itemTotal = p.getPrice() * item.getQuantity();

        return CartItemResponse.builder()
                .id(item.getId())
                .product(productResp)
                .quantity(item.getQuantity())
                .totalPrice(itemTotal)
                .build();
    }

    // -----------------------------------------------------------------
    // Legacy Cart Support for backward compatibility
    // -----------------------------------------------------------------

    @Override
    @Transactional
    public OrderResponse addToCart(com.ecommerce.com.ecommerce.flash.dto.CartRequest legacyRequest) {
        CartItemRequest req = new CartItemRequest(legacyRequest.getProductId(), legacyRequest.getQuantity());
        addItemToCart(req);

        // Bridge: also retain order record for legacy test cases if needed
        Product product = productRepository.findById(legacyRequest.getProductId()).get();
        User user = userRepository.findById(legacyRequest.getUserId()).get();

        com.ecommerce.com.ecommerce.flash.entity.Order cartOrder = new com.ecommerce.com.ecommerce.flash.entity.Order();
        cartOrder.setProduct(product);
        cartOrder.setUser(user);
        cartOrder.setQuantity(legacyRequest.getQuantity());
        cartOrder.setStatus("In Cart");
        cartOrder.setUnitPriceAtPurchase(product.getPrice());
        cartOrder.setProductNameAtPurchase(product.getName());
        cartOrder.setTotalPrice(product.getPrice() * legacyRequest.getQuantity());

        com.ecommerce.com.ecommerce.flash.entity.Order saved = orderRepository.save(cartOrder);
        return mapToLegacyOrderResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getCartItemsByUser(Long userId) {
        if (!SecurityUtils.isOwnerOrAdmin(userId)) {
            throw new UnauthorizedException("Access denied: Cannot access another user's cart.");
        }

        // Return unified cart item responses packaged as OrderResponse list for legacy clients
        CartResponse cartResp = getCartForUser(userId);
        if (cartResp.getItems() == null || cartResp.getItems().isEmpty()) {
            // Check legacy order table fallback
            return orderRepository.findByUserId(userId).stream()
                    .filter(o -> "In Cart".equalsIgnoreCase(o.getStatus()))
                    .map(this::mapToLegacyOrderResponse)
                    .collect(Collectors.toList());
        }

        return cartResp.getItems().stream().map(item -> OrderResponse.builder()
                .id(item.getId())
                .quantity(item.getQuantity())
                .status("In Cart")
                .totalPrice(item.getTotalPrice())
                .unitPriceAtPurchase(item.getProduct().getPrice())
                .productNameAtPurchase(item.getProduct().getName())
                .product(item.getProduct())
                .build()
        ).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void removeFromCart(Long orderId) {
        try {
            removeCartItem(orderId);
        } catch (Exception e) {
            // Fallback for legacy order deletion
            orderRepository.findById(orderId).ifPresent(orderRepository::delete);
        }
    }

    private OrderResponse mapToLegacyOrderResponse(com.ecommerce.com.ecommerce.flash.entity.Order order) {
        return OrderResponse.builder()
                .id(order.getId())
                .orderDate(order.getOrderDate())
                .status(order.getStatus())
                .quantity(order.getQuantity())
                .paymentMethod(order.getPaymentMethod())
                .totalPrice(order.getTotalPrice())
                .unitPriceAtPurchase(order.getUnitPriceAtPurchase())
                .productNameAtPurchase(order.getProductNameAtPurchase())
                .shippingAddress(order.getShippingAddress())
                .build();
    }
}
