package com.ecommerce.com.ecommerce.flash.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserUpdateRequest {
    @NotBlank(message = "Name cannot be blank")
    private String name;
    private String phoneNumber;
    private String address;
}
