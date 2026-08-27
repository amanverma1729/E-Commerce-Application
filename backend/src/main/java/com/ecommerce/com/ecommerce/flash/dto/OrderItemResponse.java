package com.ecommerce.com.ecommerce.flash.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItemResponse {
    private Long id;
    private Long productId;
    private String productNameAtPurchase;
    private double unitPriceAtPurchase;
    private int quantity;
    private double totalPrice;
}
