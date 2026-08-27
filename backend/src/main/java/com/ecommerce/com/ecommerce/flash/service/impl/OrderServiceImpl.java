package com.ecommerce.com.ecommerce.flash.service.impl;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ecommerce.com.ecommerce.flash.dto.CheckoutRequest;
import com.ecommerce.com.ecommerce.flash.dto.OrderItemResponse;
import com.ecommerce.com.ecommerce.flash.dto.OrderRequest;
import com.ecommerce.com.ecommerce.flash.dto.OrderResponse;
import com.ecommerce.com.ecommerce.flash.dto.PaymentResponse;
import com.ecommerce.com.ecommerce.flash.dto.ProductOwnerResponse;
import com.ecommerce.com.ecommerce.flash.dto.ProductResponse;
import com.ecommerce.com.ecommerce.flash.dto.UserResponse;
import com.ecommerce.com.ecommerce.flash.entity.Cart;
import com.ecommerce.com.ecommerce.flash.entity.CartItem;
import com.ecommerce.com.ecommerce.flash.entity.IdempotencyRecord;
import com.ecommerce.com.ecommerce.flash.entity.Order;
import com.ecommerce.com.ecommerce.flash.entity.OrderItem;
import com.ecommerce.com.ecommerce.flash.entity.Payment;
import com.ecommerce.com.ecommerce.flash.entity.Product;
import com.ecommerce.com.ecommerce.flash.entity.ProductOwner;
import com.ecommerce.com.ecommerce.flash.entity.ProductStatus;
import com.ecommerce.com.ecommerce.flash.entity.User;
import com.ecommerce.com.ecommerce.flash.exception.BadRequestException;
import com.ecommerce.com.ecommerce.flash.exception.EmptyCartException;
import com.ecommerce.com.ecommerce.flash.exception.InsufficientStockException;
import com.ecommerce.com.ecommerce.flash.exception.InvalidOrderStateException;
import com.ecommerce.com.ecommerce.flash.exception.ResourceNotFoundException;
import com.ecommerce.com.ecommerce.flash.exception.UnauthorizedException;
import com.ecommerce.com.ecommerce.flash.repository.CartRepository;
import com.ecommerce.com.ecommerce.flash.repository.IdempotencyRecordRepository;
import com.ecommerce.com.ecommerce.flash.repository.OrderItemRepository;
import com.ecommerce.com.ecommerce.flash.repository.OrderRepository;
import com.ecommerce.com.ecommerce.flash.repository.PaymentRepository;
import com.ecommerce.com.ecommerce.flash.repository.ProductRepository;
import com.ecommerce.com.ecommerce.flash.repository.UserRepository;
import com.ecommerce.com.ecommerce.flash.security.SecurityUtils;
import com.ecommerce.com.ecommerce.flash.security.UserPrincipal;
import com.ecommerce.com.ecommerce.flash.service.OrderService;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final CartRepository cartRepository;
    private final PaymentRepository paymentRepository;
    private final IdempotencyRecordRepository idempotencyRecordRepository;

    public OrderServiceImpl(OrderRepository orderRepository,
                            OrderItemRepository orderItemRepository,
                            ProductRepository productRepository,
                            UserRepository userRepository,
                            CartRepository cartRepository,
                            PaymentRepository paymentRepository,
                            IdempotencyRecordRepository idempotencyRecordRepository) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.cartRepository = cartRepository;
        this.paymentRepository = paymentRepository;
        this.idempotencyRecordRepository = idempotencyRecordRepository;
    }

    private User getAuthenticatedUser() {
        UserPrincipal principal = SecurityUtils.getCurrentUserPrincipal();
        if (principal == null) {
            throw new UnauthorizedException("Authentication required.");
        }
        return userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found."));
    }

    @Override
    @Transactional
    public OrderResponse checkout(CheckoutRequest request) {
        User user = getAuthenticatedUser();
        String idempotencyKey = request.getIdempotencyKey();

        if (idempotencyKey != null && !idempotencyKey.trim().isEmpty()) {
            Optional<IdempotencyRecord> recordOpt = idempotencyRecordRepository.findByUserIdAndIdempotencyKey(user.getId(), idempotencyKey);
            if (recordOpt.isPresent()) {
                return mapToResponse(recordOpt.get().getOrder());
            }
        }

        Cart cart = cartRepository.findByUserId(user.getId())
                .orElseThrow(() -> new EmptyCartException("Shopping cart is empty. Add items before checking out."));

        if (cart.getCartItems() == null || cart.getCartItems().isEmpty()) {
            throw new EmptyCartException("Shopping cart is empty. Add items before checking out.");
        }

        double totalOrderPrice = 0.0;
        List<OrderItem> orderItemsToSave = new ArrayList<>();
        List<Product> productsToSave = new ArrayList<>();

        for (CartItem cartItem : cart.getCartItems()) {
            Product product = productRepository.findById(cartItem.getProduct().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + cartItem.getProduct().getId()));

            if (!product.isApproved() || !product.isAvailable() || product.getStatus() != ProductStatus.APPROVED) {
                throw new BadRequestException("Product '" + product.getName() + "' is not available for purchase.");
            }

            int requestedQty = cartItem.getQuantity();
            if (requestedQty <= 0) {
                throw new BadRequestException("Invalid quantity for product: " + product.getName());
            }

            if (product.getStock() < requestedQty) {
                throw new InsufficientStockException("Insufficient stock for product: " + product.getName() + ". Available stock: " + product.getStock() + ", requested: " + requestedQty);
            }

            product.setStock(product.getStock() - requestedQty);
            productsToSave.add(product);

            double itemTotal = product.getPrice() * requestedQty;
            totalOrderPrice += itemTotal;

            OrderItem orderItem = new OrderItem();
            orderItem.setProduct(product);
            orderItem.setProductNameAtPurchase(product.getName());
            orderItem.setUnitPriceAtPurchase(product.getPrice());
            orderItem.setQuantity(requestedQty);
            orderItem.setTotalPrice(itemTotal);
            orderItemsToSave.add(orderItem);
        }

        productRepository.saveAll(productsToSave);

        Order order = new Order();
        order.setUser(user);
        order.setOrderDate(LocalDateTime.now());
        order.setStatus("CONFIRMED");
        order.setTotalPrice(totalOrderPrice);
        order.setPaymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod() : "CARD");
        order.setShippingAddress(request.getShippingAddress() != null ? request.getShippingAddress() : user.getAddress());
        order.setIdempotencyKey(idempotencyKey);

        if (!orderItemsToSave.isEmpty()) {
            OrderItem first = orderItemsToSave.get(0);
            order.setProduct(first.getProduct());
            order.setQuantity(first.getQuantity());
            order.setUnitPriceAtPurchase(first.getUnitPriceAtPurchase());
            order.setProductNameAtPurchase(first.getProductNameAtPurchase());
        }

        Order savedOrder = orderRepository.save(order);

        for (OrderItem item : orderItemsToSave) {
            item.setOrder(savedOrder);
        }
        orderItemRepository.saveAll(orderItemsToSave);
        savedOrder.setOrderItems(orderItemsToSave);

        Payment payment = new Payment();
        payment.setOrder(savedOrder);
        payment.setPaymentMethod(savedOrder.getPaymentMethod());
        payment.setPaymentStatus("COMPLETED");
        payment.setAmount(totalOrderPrice);
        payment.setTransactionId("TXN-" + System.currentTimeMillis() + "-" + savedOrder.getId());
        paymentRepository.save(payment);
        savedOrder.setPayment(payment);

        if (idempotencyKey != null && !idempotencyKey.trim().isEmpty()) {
            IdempotencyRecord record = new IdempotencyRecord();
            record.setIdempotencyKey(idempotencyKey);
            record.setUser(user);
            record.setOrder(savedOrder);
            idempotencyRecordRepository.save(record);
        }

        cart.getCartItems().clear();
        cartRepository.save(cart);

        log.info("Order checkout successful: orderId={}, userId={}, total={}", savedOrder.getId(), user.getId(), totalOrderPrice);
        return mapToResponse(savedOrder);
    }

    @Override
    @Transactional
    public OrderResponse placeOrder(OrderRequest request) {
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + request.getProductId()));

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + request.getUserId()));

        if (!product.isApproved() || !product.isAvailable() || product.getStatus() != ProductStatus.APPROVED) {
            throw new BadRequestException("Product '" + product.getName() + "' is not available for purchase.");
        }

        int requestedQty = request.getQuantity() > 0 ? request.getQuantity() : 1;

        if (product.getStock() < requestedQty) {
            throw new InsufficientStockException("Insufficient stock for product: " + product.getName() + ". Available: " + product.getStock());
        }

        product.setStock(product.getStock() - requestedQty);
        productRepository.save(product);

        Order order = new Order();
        order.setProduct(product);
        order.setUser(user);
        order.setQuantity(requestedQty);
        order.setPaymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod() : "CARD");
        order.setShippingAddress(request.getShippingAddress() != null ? request.getShippingAddress() : user.getAddress());
        order.setStatus("CONFIRMED");
        order.setOrderDate(LocalDateTime.now());

        order.setProductNameAtPurchase(product.getName());
        order.setUnitPriceAtPurchase(product.getPrice());
        order.setTotalPrice(product.getPrice() * requestedQty);

        Order savedOrder = orderRepository.save(order);

        OrderItem item = new OrderItem();
        item.setOrder(savedOrder);
        item.setProduct(product);
        item.setProductNameAtPurchase(product.getName());
        item.setUnitPriceAtPurchase(product.getPrice());
        item.setQuantity(requestedQty);
        item.setTotalPrice(product.getPrice() * requestedQty);
        orderItemRepository.save(item);
        savedOrder.setOrderItems(Collections.singletonList(item));

        Payment payment = new Payment();
        payment.setOrder(savedOrder);
        payment.setPaymentMethod(savedOrder.getPaymentMethod());
        payment.setPaymentStatus("COMPLETED");
        payment.setAmount(savedOrder.getTotalPrice());
        payment.setTransactionId("TXN-" + System.currentTimeMillis() + "-" + savedOrder.getId());
        paymentRepository.save(payment);
        savedOrder.setPayment(payment);

        return mapToResponse(savedOrder);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getOrderById(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + orderId));

        Long userId = order.getUser() != null ? order.getUser().getId() : null;
        Long ownerId = (order.getProduct() != null && order.getProduct().getProductOwner() != null)
                ? order.getProduct().getProductOwner().getProductOwnerId() : null;

        if (!SecurityUtils.isOwnerOrAdmin(userId) && !SecurityUtils.isOwnerOrAdmin(ownerId)) {
            throw new UnauthorizedException("Access denied: You cannot view this order.");
        }
        return mapToResponse(order);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getOrdersByUserId(Long userId) {
        if (!SecurityUtils.isOwnerOrAdmin(userId)) {
            throw new UnauthorizedException("Access denied: Cannot access another user's orders.");
        }
        return orderRepository.findByUserId(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getOrdersByProductOwnerId(Long productOwnerId) {
        if (!SecurityUtils.isOwnerOrAdmin(productOwnerId)) {
            throw new UnauthorizedException("Access denied: Cannot access another seller's orders.");
        }
        return orderRepository.findByProductProductOwnerProductOwnerId(productOwnerId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public OrderResponse updateOrderStatus(Long orderId, String targetStatus, String paymentMethod, int quantity) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + orderId));

        Long userId = order.getUser() != null ? order.getUser().getId() : null;
        Long ownerId = (order.getProduct() != null && order.getProduct().getProductOwner() != null)
                ? order.getProduct().getProductOwner().getProductOwnerId() : null;

        boolean isAdmin = SecurityUtils.isAdmin();
        boolean isOwner = SecurityUtils.isOwnerOrAdmin(userId);
        boolean isSeller = SecurityUtils.isOwnerOrAdmin(ownerId);

        if (!isOwner && !isSeller && !isAdmin) {
            throw new UnauthorizedException("Access denied: Cannot modify this order.");
        }

        String currentStatus = order.getStatus() != null ? order.getStatus().toUpperCase() : "PENDING";
        String nextStatus = targetStatus != null ? targetStatus.toUpperCase() : currentStatus;

        // Validation Rules for Order Lifecycle State Machine
        if (!currentStatus.equals(nextStatus)) {
            validateStatusTransition(currentStatus, nextStatus, isAdmin, isSeller, isOwner);

            // Handle cancellation stock restoration
            if ("CANCELLED".equals(nextStatus) && !"CANCELLED".equals(currentStatus)) {
                restoreOrderStock(order);
            }

            order.setStatus(nextStatus);
        }

        if (paymentMethod != null) {
            order.setPaymentMethod(paymentMethod);
        }
        if (quantity > 0) {
            order.setQuantity(quantity);
            if (order.getUnitPriceAtPurchase() != null) {
                order.setTotalPrice(order.getUnitPriceAtPurchase() * quantity);
            }
        }

        Order saved = orderRepository.save(order);
        return mapToResponse(saved);
    }

    private void validateStatusTransition(String current, String target, boolean isAdmin, boolean isSeller, boolean isOwner) {
        // Terminal states cannot be changed
        if ("CANCELLED".equals(current) || "DELIVERED".equals(current) || "PAYMENT_FAILED".equals(current)) {
            throw new InvalidOrderStateException("Cannot update order in terminal state: " + current);
        }

        // Regular CUSTOMER (User) can ONLY request cancellation
        if (isOwner && !isAdmin && !isSeller) {
            if (!"CANCELLED".equals(target)) {
                throw new InvalidOrderStateException("Customers are not authorized to update order status to: " + target);
            }
            if (!"PLACED".equals(current) && !"CONFIRMED".equals(current) && !"PENDING".equals(current) && !"ORDERED".equals(current)) {
                throw new InvalidOrderStateException("Orders in status '" + current + "' cannot be cancelled by customer.");
            }
            return;
        }

        // State machine rules for Seller / Admin
        switch (current) {
            case "PLACED":
            case "PENDING":
            case "ORDERED":
                if (!"CONFIRMED".equals(target) && !"CANCELLED".equals(target) && !"PAYMENT_FAILED".equals(target)) {
                    throw new InvalidOrderStateException("Invalid transition from " + current + " to " + target);
                }
                break;
            case "CONFIRMED":
                if (!"PROCESSING".equals(target) && !"CANCELLED".equals(target)) {
                    throw new InvalidOrderStateException("Invalid transition from CONFIRMED to " + target);
                }
                break;
            case "PROCESSING":
                if (!"SHIPPED".equals(target) && !"CANCELLED".equals(target)) {
                    throw new InvalidOrderStateException("Invalid transition from PROCESSING to " + target);
                }
                break;
            case "SHIPPED":
                if (!"DELIVERED".equals(target)) {
                    throw new InvalidOrderStateException("Invalid transition from SHIPPED to " + target);
                }
                break;
            default:
                break;
        }
    }

    private void restoreOrderStock(Order order) {
        if (order.getOrderItems() != null && !order.getOrderItems().isEmpty()) {
            for (OrderItem item : order.getOrderItems()) {
                if (item.getProduct() != null) {
                    Product p = item.getProduct();
                    p.setStock(p.getStock() + item.getQuantity());
                    productRepository.save(p);
                }
            }
        } else if (order.getProduct() != null) {
            Product p = order.getProduct();
            p.setStock(p.getStock() + order.getQuantity());
            productRepository.save(p);
        }
    }

    @Override
    @Transactional
    public void cancelOrder(Long orderId) {
        updateOrderStatus(orderId, "CANCELLED", null, 0);
    }

    private OrderResponse mapToResponse(Order order) {
        UserResponse userResp = null;
        if (order.getUser() != null) {
            User u = order.getUser();
            userResp = UserResponse.builder()
                    .id(u.getId())
                    .name(u.getName())
                    .email(u.getEmail())
                    .phoneNumber(u.getPhoneNumber())
                    .address(u.getAddress())
                    .role(u.getRole())
                    .status(u.getStatus())
                    .build();
        }

        ProductResponse productResp = null;
        if (order.getProduct() != null) {
            Product p = order.getProduct();
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
            productResp = ProductResponse.builder()
                    .id(p.getId())
                    .name(p.getName())
                    .description(p.getDescription())
                    .price(p.getPrice())
                    .stock(p.getStock())
                    .category(p.getCategory())
                    .available(p.isAvailable())
                    .approved(p.isApproved())
                    .status(p.getStatus() != null ? p.getStatus().name() : "PENDING")
                    .productOwner(ownerResp)
                    .build();
        }

        List<OrderItemResponse> itemResponses = order.getOrderItems() != null ?
                order.getOrderItems().stream().map(item -> OrderItemResponse.builder()
                        .id(item.getId())
                        .productId(item.getProduct() != null ? item.getProduct().getId() : null)
                        .productNameAtPurchase(item.getProductNameAtPurchase())
                        .unitPriceAtPurchase(item.getUnitPriceAtPurchase())
                        .quantity(item.getQuantity())
                        .totalPrice(item.getTotalPrice())
                        .build()
                ).collect(Collectors.toList()) : Collections.emptyList();

        PaymentResponse paymentResp = null;
        if (order.getPayment() != null) {
            Payment p = order.getPayment();
            paymentResp = PaymentResponse.builder()
                    .id(p.getId())
                    .orderId(order.getId())
                    .paymentMethod(p.getPaymentMethod())
                    .paymentStatus(p.getPaymentStatus())
                    .amount(p.getAmount())
                    .transactionId(p.getTransactionId())
                    .failureReason(p.getFailureReason())
                    .build();
        }

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
                .idempotencyKey(order.getIdempotencyKey())
                .user(userResp)
                .product(productResp)
                .orderItems(itemResponses)
                .payment(paymentResp)
                .build();
    }
}
