package com.ecommerce.com.ecommerce.flash.payment;

import org.springframework.stereotype.Component;

import com.ecommerce.com.ecommerce.flash.dto.PaymentProcessRequest;
import com.ecommerce.com.ecommerce.flash.dto.PaymentResult;

@Component
public class MockPaymentProvider implements PaymentProvider {

    @Override
    public PaymentResult processPayment(PaymentProcessRequest request, double amount) {
        String method = request.getPaymentMethod() != null ? request.getPaymentMethod().toUpperCase() : "MOCK_PAYMENT";
        String simulate = request.getSimulateStatus() != null ? request.getSimulateStatus().toUpperCase() : "SUCCESS";

        if ("COD".equals(method)) {
            return PaymentResult.builder()
                    .success(true)
                    .status("PENDING")
                    .amount(amount)
                    .transactionId("COD-" + System.currentTimeMillis())
                    .failureReason(null)
                    .build();
        }

        if ("FAILURE".equals(simulate) || "FAILED".equals(simulate) || amount <= 0) {
            return PaymentResult.builder()
                    .success(false)
                    .status("FAILED")
                    .amount(amount)
                    .transactionId(null)
                    .failureReason("Mock Payment Failed: Simulated card rejection or insufficient funds")
                    .build();
        }

        return PaymentResult.builder()
                .success(true)
                .status("SUCCESS")
                .amount(amount)
                .transactionId("MOCK-TXN-" + System.currentTimeMillis())
                .failureReason(null)
                .build();
    }
}
