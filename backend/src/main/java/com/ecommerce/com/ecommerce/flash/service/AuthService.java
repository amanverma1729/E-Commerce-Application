package com.ecommerce.com.ecommerce.flash.service;

import com.ecommerce.com.ecommerce.flash.dto.AuthRequest;
import com.ecommerce.com.ecommerce.flash.dto.AuthResponse;
import com.ecommerce.com.ecommerce.flash.dto.RegisterRequest;
import com.ecommerce.com.ecommerce.flash.dto.SellerRegisterRequest;

public interface AuthService {
    AuthResponse login(AuthRequest authRequest);
    AuthResponse registerUser(RegisterRequest registerRequest);
    AuthResponse registerSeller(SellerRegisterRequest sellerRegisterRequest);
    AuthResponse refreshToken(String refreshToken);
}
