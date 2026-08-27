package com.ecommerce.com.ecommerce.flash.dto;

import java.util.List;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductRequest {
    @NotBlank(message = "Product name is required")
    private String name;

    private String description;

    @Positive(message = "Price must be greater than zero")
    private double price;

    @Min(value = 0, message = "Stock cannot be negative")
    private int stock;

    @NotBlank(message = "Category is required")
    private String category;

    @NotNull(message = "Product owner ID is required")
    private Long productOwnerId;

    public void setSellerId(Long sellerId) {
        if (this.productOwnerId == null) {
            this.productOwnerId = sellerId;
        }
    }

    public Long getSellerId() {
        return this.productOwnerId;
    }

    private boolean available = true;
    private List<String> productSizes;
    private List<String> productColors;
    private String productImageBase64;
}
