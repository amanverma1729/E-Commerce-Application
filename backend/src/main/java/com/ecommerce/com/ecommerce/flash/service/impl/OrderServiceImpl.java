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
import com.ecommerce.com.ecommerce.flash.exception.DuplicateCheckoutException;
import com.ecommerce.com.ecommerce.flash.exception.EmptyCartException;
import com.ecommerce.com.ecommerce.flash.exception.InsufficientStockException;
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

        // 1. Idempotency Key Validation
        if (idempotencyKey != null && !idempotencyKey.trim().isEmpty()) {
            Optional<IdempotencyRecord> recordOpt = idempotencyRecordRepository.findByUserIdAndIdempotencyKey(user.getId(), idempotencyKey);
            if (recordOpt.isPresent()) {
                // Idempotent duplicate check: return existing order response
                Order existingOrder = recordOpt.get().getOrder();
                return mapToResponse(existingOrder);
            }
        }

        // 2. Fetch & Validate Cart
        Cart cart = cartRepository.findByUserId(user.getId())
                .orElseThrow(() -> new EmptyCartException("Shopping cart is empty. Add items before checking out."));

        if (cart.getCartItems() == null || cart.getCartItems().isEmpty()) {
            throw new EmptyCartException("Shopping cart is empty. Add items before checking out.");
        }

        // 3. Product & Stock Validation
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

            // Deduct stock (Optimistic Locking via @Version handles concurrent update conflicts)
            product.setStock(product.getStock() - requestedQty);
            productsToSave.add(product);

            // Trusted backend price calculation
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

        // Save updated product stock
        productRepository.saveAll(productsToSave);

        // 4. Create Order
        Order order = new Order();
        order.setUser(user);
        order.setOrderDate(LocalDateTime.now());
        order.setStatus("CONFIRMED");
        order.setTotalPrice(totalOrderPrice);
        order.setPaymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod() : "CARD");
        order.setShippingAddress(request.getShippingAddress() != null ? request.getShippingAddress() : user.getAddress());
        order.setIdempotencyKey(idempotencyKey);

        // Legacy compatibility snapshot fields from first item
        if (!orderItemsToSave.isEmpty()) {
            OrderItem first = orderItemsToSave.get(0);
            order.setProduct(first.getProduct());
            order.setQuantity(first.getQuantity());
            order.setUnitPriceAtPurchase(first.getUnitPriceAtPurchase());
            order.setProductNameAtPurchase(first.getProductNameAtPurchase());
        }

        Order savedOrder = orderRepository.save(order);

        // Link and save order items
        for (OrderItem item : orderItemsToSave) {
            item.setOrder(savedOrder);
        }
        orderItemRepository.saveAll(orderItemsToSave);
        savedOrder.setOrderItems(orderItemsToSave);

        // 5. Create Payment Record
        Payment payment = new Payment();
        payment.setOrder(savedOrder);
        payment.setPaymentMethod(savedOrder.getPaymentMethod());
        payment.setPaymentStatus("COMPLETED");
        payment.setAmount(totalOrderPrice);
        payment.setTransactionId("TXN-" + System.currentTimeMillis() + "-" + savedOrder.getId());
        paymentRepository.save(payment);
        savedOrder.setPayment(payment);

        // 6. Save Idempotency Record if key was supplied
        if (idempotencyKey != null && !idempotencyKey.trim().isEmpty()) {
            IdempotencyRecord record = new IdempotencyRecord();
            record.setIdempotencyKey(idempotencyKey);
            record.setUser(user);
            record.setOrder(savedOrder);
            idempotencyRecordRepository.save(record);
        }

        // 7. Clear Shopping Cart
        cart.getCartItems().clear();
        cartRepository.save(cart);

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
    public OrderResponse updateOrderStatus(Long orderId, String status, String paymentMethod, int quantity) {
        Order existingOrder = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + orderId));

        Long userId = existingOrder.getUser() != null ? existingOrder.getUser().getId() : null;
        Long ownerId = (existingOrder.getProduct() != null && existingOrder.getProduct().getProductOwner() != null)
                ? existingOrder.getProduct().getProductOwner().getProductOwnerId() : null;

        // Step 15: Status updates restricted to seller/admin or legitimate user rules
        if (!SecurityUtils.isOwnerOrAdmin(userId) && !SecurityUtils.isOwnerOrAdmin(ownerId)) {
            throw new UnauthorizedException("Access denied: Cannot modify this order.");
        }

        if (status != null) {
            existingOrder.setStatus(status);
        }
        if (paymentMethod != null) {
            existingOrder.setPaymentMethod(paymentMethod);
        }
        if (quantity > 0) {
            existingOrder.setQuantity(quantity);
            if (existingOrder.getUnitPriceAtPurchase() != null) {
                existingOrder.setTotalPrice(existingOrder.getUnitPriceAtPurchase() * quantity);
            }
        }

        Order saved = orderRepository.save(existingOrder);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public void cancelOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + orderId));

        Long userId = order.getUser() != null ? order.getUser().getId() : null;
        if (!SecurityUtils.isOwnerOrAdmin(userId)) {
            throw new UnauthorizedException("Access denied: Cannot cancel another user's order.");
        }

        // Restore product inventory on order cancellation
        if (order.getOrderItems() != null && !order.getOrderItems().isEmpty()) {
            for (OrderItem item : order.getOrderItems()) {
                if (item.getProduct() != null) {
                    Product p = item.getProduct();
                    p.setStock(p.getStock() + item.getQuantity());
                    productRepository.save(p);
                }
            }
        } else if (order.getProduct() != null && !"In Cart".equalsIgnoreCase(order.getStatus())) {
            Product product = order.getProduct();
            product.setStock(product.getStock() + order.getQuantity());
            productRepository.save(product);
        }

        orderRepository.delete(order);
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
