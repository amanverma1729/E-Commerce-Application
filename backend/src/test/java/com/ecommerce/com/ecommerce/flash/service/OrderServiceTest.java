package com.ecommerce.com.ecommerce.flash.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import com.ecommerce.com.ecommerce.flash.dto.CheckoutRequest;
import com.ecommerce.com.ecommerce.flash.dto.OrderRequest;
import com.ecommerce.com.ecommerce.flash.dto.OrderResponse;
import com.ecommerce.com.ecommerce.flash.entity.Cart;
import com.ecommerce.com.ecommerce.flash.entity.CartItem;
import com.ecommerce.com.ecommerce.flash.entity.IdempotencyRecord;
import com.ecommerce.com.ecommerce.flash.entity.Order;
import com.ecommerce.com.ecommerce.flash.entity.OrderItem;
import com.ecommerce.com.ecommerce.flash.entity.Product;
import com.ecommerce.com.ecommerce.flash.entity.ProductStatus;
import com.ecommerce.com.ecommerce.flash.entity.User;
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
import com.ecommerce.com.ecommerce.flash.security.UserPrincipal;
import com.ecommerce.com.ecommerce.flash.service.impl.OrderServiceImpl;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private OrderItemRepository orderItemRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private CartRepository cartRepository;

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private IdempotencyRecordRepository idempotencyRecordRepository;

    @InjectMocks
    private OrderServiceImpl orderService;

    private User user;
    private Product product;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(10L);
        user.setName("John Customer");
        user.setEmail("john@test.com");
        user.setRole("ROLE_USER");

        product = new Product();
        product.setId(100L);
        product.setName("Wireless Mouse");
        product.setPrice(25.0);
        product.setStock(5);
        product.setApproved(true);
        product.setAvailable(true);
        product.setStatus(ProductStatus.APPROVED);

        UserPrincipal principal = UserPrincipal.create(user);
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    @Test
    void testPlaceOrder_Success_DeductsStock() {
        OrderRequest request = new OrderRequest(100L, 10L, 2, "CARD", "123 Main St");

        when(productRepository.findById(100L)).thenReturn(Optional.of(product));
        when(userRepository.findById(10L)).thenReturn(Optional.of(user));
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> {
            Order o = inv.getArgument(0);
            o.setId(1L);
            return o;
        });

        OrderResponse response = orderService.placeOrder(request);

        assertNotNull(response);
        assertEquals(3, product.getStock());
        assertEquals(50.0, response.getTotalPrice());
        assertEquals("CONFIRMED", response.getStatus());
        verify(productRepository).save(product);
        verify(orderRepository).save(any(Order.class));
    }

    @Test
    void testCheckout_Success() {
        CheckoutRequest request = CheckoutRequest.builder()
                .paymentMethod("CARD")
                .shippingAddress("456 Park Ave")
                .idempotencyKey("KEY-123")
                .build();

        Cart cart = new Cart();
        cart.setId(1L);
        cart.setUser(user);
        List<CartItem> cartItems = new ArrayList<>();
        CartItem cartItem = new CartItem(10L, cart, product, 2, null, null);
        cartItems.add(cartItem);
        cart.setCartItems(cartItems);

        when(userRepository.findById(10L)).thenReturn(Optional.of(user));
        when(idempotencyRecordRepository.findByUserIdAndIdempotencyKey(10L, "KEY-123")).thenReturn(Optional.empty());
        when(cartRepository.findByUserId(10L)).thenReturn(Optional.of(cart));
        when(productRepository.findById(100L)).thenReturn(Optional.of(product));
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> {
            Order o = inv.getArgument(0);
            o.setId(99L);
            return o;
        });

        OrderResponse response = orderService.checkout(request);

        assertNotNull(response);
        assertEquals(3, product.getStock());
        assertEquals(50.0, response.getTotalPrice());
        assertEquals("CONFIRMED", response.getStatus());
    }

    @Test
    void testCustomerCancelOrder_Success_RestoresInventory() {
        Order existingOrder = new Order();
        existingOrder.setId(200L);
        existingOrder.setUser(user);
        existingOrder.setProduct(product);
        existingOrder.setQuantity(2);
        existingOrder.setStatus("CONFIRMED");

        OrderItem item = new OrderItem();
        item.setOrder(existingOrder);
        item.setProduct(product);
        item.setQuantity(2);
        existingOrder.setOrderItems(List.of(item));

        when(orderRepository.findById(200L)).thenReturn(Optional.of(existingOrder));
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> inv.getArgument(0));

        orderService.cancelOrder(200L);

        assertEquals("CANCELLED", existingOrder.getStatus());
        assertEquals(7, product.getStock()); // Restored from 5 to 7 (5 + 2)
        verify(productRepository).save(product);
    }

    @Test
    void testCustomerSetStatusToDelivered_ThrowsException() {
        Order existingOrder = new Order();
        existingOrder.setId(200L);
        existingOrder.setUser(user);
        existingOrder.setStatus("CONFIRMED");

        when(orderRepository.findById(200L)).thenReturn(Optional.of(existingOrder));

        assertThrows(InvalidOrderStateException.class, () -> orderService.updateOrderStatus(200L, "DELIVERED", null, 0));
    }

    @Test
    void testUpdateStatus_TerminalState_ThrowsException() {
        User admin = new User();
        admin.setId(1L);
        admin.setRole("ROLE_ADMIN");
        UserPrincipal adminPrincipal = UserPrincipal.create(admin);
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(adminPrincipal, null, adminPrincipal.getAuthorities()));

        Order cancelledOrder = new Order();
        cancelledOrder.setId(300L);
        cancelledOrder.setUser(user);
        cancelledOrder.setStatus("CANCELLED");

        when(orderRepository.findById(300L)).thenReturn(Optional.of(cancelledOrder));

        assertThrows(InvalidOrderStateException.class, () -> orderService.updateOrderStatus(300L, "SHIPPED", null, 0));
    }

    @Test
    void testGetOrders_AnotherUser_ThrowsException() {
        assertThrows(UnauthorizedException.class, () -> orderService.getOrdersByUserId(999L));
    }

    @Test
    void testCheckout_EmptyCart_ThrowsException() {
        CheckoutRequest request = CheckoutRequest.builder().shippingAddress("123 Street").build();

        when(userRepository.findById(10L)).thenReturn(Optional.of(user));
        when(cartRepository.findByUserId(10L)).thenReturn(Optional.empty());

        assertThrows(EmptyCartException.class, () -> orderService.checkout(request));
    }

    @Test
    void testCheckout_IdempotentDuplicate_ReturnsExistingOrder() {
        CheckoutRequest request = CheckoutRequest.builder()
                .shippingAddress("123 Street")
                .paymentMethod("CARD")
                .idempotencyKey("SAME-KEY")
                .build();

        Order existingOrder = new Order();
        existingOrder.setId(500L);
        existingOrder.setUser(user);
        existingOrder.setTotalPrice(100.0);
        existingOrder.setStatus("CONFIRMED");

        String hash = String.valueOf(("123 Street|CARD").hashCode());
        IdempotencyRecord record = new IdempotencyRecord(1L, "SAME-KEY", user, existingOrder, hash, null);

        when(userRepository.findById(10L)).thenReturn(Optional.of(user));
        when(idempotencyRecordRepository.findByUserIdAndIdempotencyKey(10L, "SAME-KEY")).thenReturn(Optional.of(record));

        OrderResponse response = orderService.checkout(request);

        assertNotNull(response);
        assertEquals(500L, response.getId());
    }

    @Test
    void testCheckout_IdempotentDifferentPayload_ThrowsException() {
        CheckoutRequest request = CheckoutRequest.builder()
                .shippingAddress("DIFFERENT ADDRESS")
                .paymentMethod("CARD")
                .idempotencyKey("SAME-KEY")
                .build();

        Order existingOrder = new Order();
        existingOrder.setId(500L);
        existingOrder.setUser(user);

        String originalHash = String.valueOf(("123 Street|CARD").hashCode());
        IdempotencyRecord record = new IdempotencyRecord(1L, "SAME-KEY", user, existingOrder, originalHash, null);

        when(userRepository.findById(10L)).thenReturn(Optional.of(user));
        when(idempotencyRecordRepository.findByUserIdAndIdempotencyKey(10L, "SAME-KEY")).thenReturn(Optional.of(record));

        assertThrows(com.ecommerce.com.ecommerce.flash.exception.BadRequestException.class, () -> orderService.checkout(request));
    }

    @Test
    void testPlaceOrder_InsufficientStock_ThrowsException() {
        OrderRequest request = new OrderRequest(100L, 10L, 10, "CARD", "123 Main St");

        when(productRepository.findById(100L)).thenReturn(Optional.of(product));
        when(userRepository.findById(10L)).thenReturn(Optional.of(user));

        assertThrows(InsufficientStockException.class, () -> orderService.placeOrder(request));
    }

    @Test
    void testPlaceOrder_ProductNotFound_ThrowsException() {
        OrderRequest request = new OrderRequest(999L, 10L, 1, "CARD", "123 Main St");

        when(productRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> orderService.placeOrder(request));
    }
}
