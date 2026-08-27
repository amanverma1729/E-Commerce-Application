package com.ecommerce.com.ecommerce.flash.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.ecommerce.com.ecommerce.flash.dto.ApiResponse;
import com.ecommerce.com.ecommerce.flash.dto.UserResponse;
import com.ecommerce.com.ecommerce.flash.dto.UserUpdateRequest;
import com.ecommerce.com.ecommerce.flash.service.UserService;

import jakarta.validation.Valid;

@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"}, allowCredentials = "true")
@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<ApiResponse<UserResponse>> getUserByEmail(@PathVariable String email) {
        UserResponse response = userService.getUserByEmail(email);
        return ResponseEntity.ok(ApiResponse.success("User profile retrieved successfully", response));
    }

    @GetMapping("/id/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(@PathVariable Long id) {
        UserResponse response = userService.getUserById(id);
        return ResponseEntity.ok(ApiResponse.success("User profile retrieved successfully", response));
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> updateUser(@PathVariable Long id, @Valid @RequestBody UserUpdateRequest updateRequest) {
        UserResponse response = userService.updateUser(id, updateRequest);
        return ResponseEntity.ok(ApiResponse.success("User profile updated successfully", response));
    }
}
