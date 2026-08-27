package com.ecommerce.com.ecommerce.flash.service;

import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import com.ecommerce.com.ecommerce.flash.dto.PaymentProcessRequest;
import com.ecommerce.com.ecommerce.flash.dto.PaymentResponse;
import com.ecommerce.com.ecommerce.flash.dto.PaymentResult;
import com.ecommerce.com.ecommerce.flash.entity.Order;
import com.ecommerce.com.ecommerce.flash.entity.OrderItem;
import com.ecommerce.com.ecommerce.flash.entity.Payment;
import com.ecommerce.com.ecommerce.flash.entity.Product;
import com.ecommerce.com.ecommerce.flash.entity.User;
import com.ecommerce.com.ecommerce.flash.payment.PaymentProvider;
import com.ecommerce.com.ecommerce.flash.repository.OrderRepository;
import com.ecommerce.com.ecommerce.flash.repository.PaymentRepository;
import com.ecommerce.com.ecommerce.flash.repository.ProductRepository;
import com.ecommerce.com.ecommerce.flash.security.UserPrincipal;
import com.ecommerce.com.ecommerce.flash.service.impl.PaymentServiceImpl;

@ExtendWith(MockitoExtension.class)
class PaymentServiceTest {

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private PaymentProvider paymentProvider;

    @InjectMocks
    private PaymentServiceImpl paymentService;

    private User user;
    private Order order;
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
        product.setName("Smart Watch");
        product.setPrice(150.0);
        product.setStock(8);

        order = new Order();
        order.setId(50L);
        order.setUser(user);
        order.setTotalPrice(150.0);
        order.setStatus("PLACED");

        OrderItem item = new OrderItem();
        item.setId(1L);
        item.setOrder(order);
        item.setProduct(product);
        item.setQuantity(2);
        order.setOrderItems(Collections.singletonList(item));

        UserPrincipal principal = UserPrincipal.create(user);
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    @Test
    void testProcessPayment_COD_Success() {
        PaymentProcessRequest request = PaymentProcessRequest.builder()
                .orderId(50L)
                .paymentMethod("COD")
                .build();

        PaymentResult mockResult = PaymentResult.builder()
                .success(true)
                .status("PENDING")
                .amount(150.0)
                .transactionId("COD-12345")
                .build();

        when(orderRepository.findById(50L)).thenReturn(Optional.of(order));
        when(paymentProvider.processPayment(any(), eq(150.0))).thenReturn(mockResult);
        when(paymentRepository.findByOrderId(50L)).thenReturn(Optional.empty());
        when(paymentRepository.save(any(Payment.class))).thenAnswer(inv -> inv.getArgument(0));

        PaymentResponse response = paymentService.processPayment(request);

        assertNotNull(response);
        assertEquals("PENDING", response.getPaymentStatus());
        assertEquals("COD", response.getPaymentMethod());
        assertEquals("CONFIRMED", order.getStatus());
    }

    @Test
    void testProcessPayment_MockPayment_Success() {
        PaymentProcessRequest request = PaymentProcessRequest.builder()
                .orderId(50L)
                .paymentMethod("MOCK_PAYMENT")
                .simulateStatus("SUCCESS")
                .build();

        PaymentResult mockResult = PaymentResult.builder()
                .success(true)
                .status("SUCCESS")
                .amount(150.0)
                .transactionId("MOCK-TXN-999")
                .build();

        when(orderRepository.findById(50L)).thenReturn(Optional.of(order));
        when(paymentProvider.processPayment(any(), eq(150.0))).thenReturn(mockResult);
        when(paymentRepository.findByOrderId(50L)).thenReturn(Optional.empty());
        when(paymentRepository.save(any(Payment.class))).thenAnswer(inv -> inv.getArgument(0));

        PaymentResponse response = paymentService.processPayment(request);

        assertNotNull(response);
        assertEquals("SUCCESS", response.getPaymentStatus());
        assertEquals("CONFIRMED", order.getStatus());
    }

    @Test
    void testProcessPayment_MockPayment_Failure_RestoresStock() {
        PaymentProcessRequest request = PaymentProcessRequest.builder()
                .orderId(50L)
                .paymentMethod("MOCK_PAYMENT")
                .simulateStatus("FAILURE")
                .build();

        PaymentResult mockResult = PaymentResult.builder()
                .success(false)
                .status("FAILED")
                .amount(150.0)
                .failureReason("Simulated payment failure")
                .build();

        when(orderRepository.findById(50L)).thenReturn(Optional.of(order));
        when(paymentProvider.processPayment(any(), eq(150.0))).thenReturn(mockResult);
        when(paymentRepository.findByOrderId(50L)).thenReturn(Optional.empty());
        when(paymentRepository.save(any(Payment.class))).thenAnswer(inv -> inv.getArgument(0));

        PaymentResponse response = paymentService.processPayment(request);

        assertNotNull(response);
        assertEquals("FAILED", response.getPaymentStatus());
        assertEquals("Simulated payment failure", response.getFailureReason());
        assertEquals("PAYMENT_FAILED", order.getStatus());
        assertEquals(10, product.getStock()); // Stock restored from 8 to 10 (8 + 2)
        verify(productRepository).save(product);
    }
}
