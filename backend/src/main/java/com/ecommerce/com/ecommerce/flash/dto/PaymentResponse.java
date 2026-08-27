package com.ecommerce.com.ecommerce.flash.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentResponse {
    private Long id;
    private Long orderId;
    private String paymentMethod;
    private String paymentStatus;
    private double amount;
    private String transactionId;
}
