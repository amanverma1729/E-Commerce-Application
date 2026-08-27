package com.ecommerce.com.ecommerce.flash.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartItemResponse {
    private Long id;
    private ProductResponse product;
    private int quantity;
    private double totalPrice;
}
