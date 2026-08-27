package com.ecommerce.com.ecommerce.flash.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductOwnerResponse {
    private Long productOwnerId;
    private String productOwnerName;
    private String productOwnerEmail;
    private Long productOwnerNumber;
}
