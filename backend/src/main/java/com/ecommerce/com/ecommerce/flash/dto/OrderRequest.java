package com.ecommerce.com.ecommerce.flash.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderRequest {
    @NotNull(message = "Product ID is required")
    private Long productId;

    @NotNull(message = "User ID is required")
    private Long userId;

    @Min(value = 1, message = "Quantity must be at least 1")
    private int quantity = 1;

    private String paymentMethod = "CARD";
    private String shippingAddress;
}
