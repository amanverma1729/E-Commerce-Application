package com.ecommerce.com.ecommerce.flash.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ecommerce.com.ecommerce.flash.dto.AuthRequest;
import com.ecommerce.com.ecommerce.flash.dto.AuthResponse;
import com.ecommerce.com.ecommerce.flash.service.AuthService;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"}, allowCredentials = "true")
public class AuthorizeController {

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginData) {
        String email = loginData.get("email");
        String password = loginData.get("password");

        try {
            AuthResponse authResponse = authService.login(new AuthRequest(email, password));

            Map<String, Object> response = new HashMap<>();
            response.put("type", authResponse.getRole().replace("ROLE_", ""));
            response.put("id", authResponse.getId());
            response.put("accessToken", authResponse.getAccessToken());
            response.put("refreshToken", authResponse.getRefreshToken());
            response.put("message", "Login successful");
            return ResponseEntity.ok(response);
        } catch (Exception ex) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Invalid credentials");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }
    }
}
