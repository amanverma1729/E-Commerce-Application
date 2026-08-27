package com.ecommerce.com.ecommerce.flash.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SellerRegisterRequest {

    @NotBlank(message = "Product owner name is required")
    private String productOwnerName;

    @NotBlank(message = "Product owner email is required")
    @Email(message = "Invalid email format")
    private String productOwnerEmail;

    @NotBlank(message = "Product owner password is required")
    @Size(min = 6, message = "Password must be at least 6 characters long")
    private String productOwnerPassword;

    @NotNull(message = "Product owner phone number is required")
    private Long productOwnerNumber;
}
