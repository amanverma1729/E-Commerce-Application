package com.ecommerce.com.ecommerce.flash.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminResponse {
    private Long adminId;
    private String adminName;
    private String adminEmail;
}
