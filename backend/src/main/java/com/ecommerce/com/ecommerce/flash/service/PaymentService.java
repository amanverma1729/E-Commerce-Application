package com.ecommerce.com.ecommerce.flash.service;

import com.ecommerce.com.ecommerce.flash.dto.PaymentProcessRequest;
import com.ecommerce.com.ecommerce.flash.dto.PaymentResponse;

public interface PaymentService {
    PaymentResponse processPayment(PaymentProcessRequest request);
    PaymentResponse getPaymentByOrderId(Long orderId);
}
