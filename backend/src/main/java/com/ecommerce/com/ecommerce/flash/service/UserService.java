package com.ecommerce.com.ecommerce.flash.service;

import com.ecommerce.com.ecommerce.flash.dto.UserResponse;
import com.ecommerce.com.ecommerce.flash.dto.UserUpdateRequest;

public interface UserService {
    UserResponse getUserById(Long id);
    UserResponse getUserByEmail(String email);
    UserResponse updateUser(Long id, UserUpdateRequest updateRequest);
}
