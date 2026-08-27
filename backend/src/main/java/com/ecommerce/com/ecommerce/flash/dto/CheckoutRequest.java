package com.ecommerce.com.ecommerce.flash.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CheckoutRequest {

    @Builder.Default
    private String paymentMethod = "CARD";

    @NotBlank(message = "Shipping address is required")
    private String shippingAddress;

    private String idempotencyKey;
}
