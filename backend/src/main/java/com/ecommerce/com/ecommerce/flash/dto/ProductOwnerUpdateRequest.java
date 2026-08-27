package com.ecommerce.com.ecommerce.flash.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductOwnerUpdateRequest {
    @NotBlank(message = "Product owner name is required")
    private String productOwnerName;

    @NotNull(message = "Product owner phone number is required")
    private Long productOwnerNumber;
}
