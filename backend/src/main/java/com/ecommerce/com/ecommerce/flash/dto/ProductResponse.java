package com.ecommerce.com.ecommerce.flash.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductResponse {
    private Long id;
    private String name;
    private String description;
    private double price;
    private int stock;
    private String category;
    private boolean available;
    private List<String> productSizes;
    private List<String> productColors;
    private String productImageBase64;
    private ProductOwnerResponse productOwner;
    private boolean approved;
    private String status;
}
