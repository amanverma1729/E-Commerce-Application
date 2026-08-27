package com.ecommerce.com.ecommerce.flash.dto;

import java.time.LocalDateTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderResponse {
    private Long id;
    private LocalDateTime orderDate;
    private String status;
    private int quantity;
    private String paymentMethod;
    private Double totalPrice;
    private Double unitPriceAtPurchase;
    private String productNameAtPurchase;
    private String shippingAddress;
    private String idempotencyKey;
    private UserResponse user;
    private ProductResponse product;
    private List<OrderItemResponse> orderItems;
    private PaymentResponse payment;
}
