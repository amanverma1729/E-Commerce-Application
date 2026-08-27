package com.ecommerce.com.ecommerce.flash.payment;

import com.ecommerce.com.ecommerce.flash.dto.PaymentProcessRequest;
import com.ecommerce.com.ecommerce.flash.dto.PaymentResult;

public interface PaymentProvider {
    PaymentResult processPayment(PaymentProcessRequest request, double amount);
}
