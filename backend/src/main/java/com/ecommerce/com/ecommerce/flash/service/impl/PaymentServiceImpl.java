package com.ecommerce.com.ecommerce.flash.service.impl;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ecommerce.com.ecommerce.flash.dto.PaymentProcessRequest;
import com.ecommerce.com.ecommerce.flash.dto.PaymentResponse;
import com.ecommerce.com.ecommerce.flash.dto.PaymentResult;
import com.ecommerce.com.ecommerce.flash.entity.Order;
import com.ecommerce.com.ecommerce.flash.entity.OrderItem;
import com.ecommerce.com.ecommerce.flash.entity.Payment;
import com.ecommerce.com.ecommerce.flash.entity.Product;
import com.ecommerce.com.ecommerce.flash.exception.ResourceNotFoundException;
import com.ecommerce.com.ecommerce.flash.exception.UnauthorizedException;
import com.ecommerce.com.ecommerce.flash.payment.PaymentProvider;
import com.ecommerce.com.ecommerce.flash.repository.OrderRepository;
import com.ecommerce.com.ecommerce.flash.repository.PaymentRepository;
import com.ecommerce.com.ecommerce.flash.repository.ProductRepository;
import com.ecommerce.com.ecommerce.flash.security.SecurityUtils;
import com.ecommerce.com.ecommerce.flash.service.PaymentService;

@Service
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final PaymentProvider paymentProvider;

    public PaymentServiceImpl(PaymentRepository paymentRepository,
                              OrderRepository orderRepository,
                              ProductRepository productRepository,
                              PaymentProvider paymentProvider) {
        this.paymentRepository = paymentRepository;
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.paymentProvider = paymentProvider;
    }

    @Override
    @Transactional
    public PaymentResponse processPayment(PaymentProcessRequest request) {
        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + request.getOrderId()));

        Long userId = order.getUser() != null ? order.getUser().getId() : null;
        if (!SecurityUtils.isOwnerOrAdmin(userId)) {
            throw new UnauthorizedException("Access denied: You cannot process payment for another user's order.");
        }

        PaymentResult result = paymentProvider.processPayment(request, order.getTotalPrice());

        Payment payment = paymentRepository.findByOrderId(order.getId())
                .orElseGet(() -> {
                    Payment p = new Payment();
                    p.setOrder(order);
                    return p;
                });

        payment.setPaymentMethod(request.getPaymentMethod());
        payment.setAmount(order.getTotalPrice());

        if (result.isSuccess()) {
            payment.setPaymentStatus(result.getStatus());
            payment.setTransactionId(result.getTransactionId());
            payment.setFailureReason(null);

            order.setStatus("CONFIRMED");
            order.setPaymentMethod(request.getPaymentMethod());
        } else {
            payment.setPaymentStatus("FAILED");
            payment.setTransactionId(null);
            payment.setFailureReason(result.getFailureReason());

            order.setStatus("PAYMENT_FAILED");

            // Payment Failure Handling: Restore deducted stock to inventory
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

        orderRepository.save(order);
        Payment savedPayment = paymentRepository.save(payment);

        return mapToResponse(savedPayment);
    }

    @Override
    @Transactional(readOnly = true)
    public PaymentResponse getPaymentByOrderId(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + orderId));

        Long userId = order.getUser() != null ? order.getUser().getId() : null;
        if (!SecurityUtils.isOwnerOrAdmin(userId)) {
            throw new UnauthorizedException("Access denied: You cannot view payment details for another user's order.");
        }

        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment record not found for order ID: " + orderId));

        return mapToResponse(payment);
    }

    private PaymentResponse mapToResponse(Payment payment) {
        return PaymentResponse.builder()
                .id(payment.getId())
                .orderId(payment.getOrder() != null ? payment.getOrder().getId() : null)
                .paymentMethod(payment.getPaymentMethod())
                .paymentStatus(payment.getPaymentStatus())
                .amount(payment.getAmount())
                .transactionId(payment.getTransactionId())
                .failureReason(payment.getFailureReason())
                .build();
    }
}
