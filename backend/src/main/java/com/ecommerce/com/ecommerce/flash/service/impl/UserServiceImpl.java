package com.ecommerce.com.ecommerce.flash.service.impl;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ecommerce.com.ecommerce.flash.dto.UserResponse;
import com.ecommerce.com.ecommerce.flash.dto.UserUpdateRequest;
import com.ecommerce.com.ecommerce.flash.entity.User;
import com.ecommerce.com.ecommerce.flash.exception.ResourceNotFoundException;
import com.ecommerce.com.ecommerce.flash.exception.UnauthorizedException;
import com.ecommerce.com.ecommerce.flash.repository.UserRepository;
import com.ecommerce.com.ecommerce.flash.security.SecurityUtils;
import com.ecommerce.com.ecommerce.flash.security.UserPrincipal;
import com.ecommerce.com.ecommerce.flash.service.UserService;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    public UserServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserById(Long id) {
        if (!SecurityUtils.isOwnerOrAdmin(id)) {
            throw new UnauthorizedException("Access denied: Cannot access another user's profile.");
        }
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + id));
        return mapToResponse(user);
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserByEmail(String email) {
        UserPrincipal principal = SecurityUtils.getCurrentUserPrincipal();
        if (principal == null || (!principal.getEmail().equalsIgnoreCase(email) && !SecurityUtils.isAdmin())) {
            throw new UnauthorizedException("Access denied: Cannot access another user's profile.");
        }
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        return mapToResponse(user);
    }

    @Override
    @Transactional
    public UserResponse updateUser(Long id, UserUpdateRequest updateRequest) {
        if (!SecurityUtils.isOwnerOrAdmin(id)) {
            throw new UnauthorizedException("Access denied: Cannot modify another user's profile.");
        }
        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + id));

        if (updateRequest.getName() != null) {
            existingUser.setName(updateRequest.getName());
        }
        if (updateRequest.getPhoneNumber() != null) {
            existingUser.setPhoneNumber(updateRequest.getPhoneNumber());
        }
        if (updateRequest.getAddress() != null) {
            existingUser.setAddress(updateRequest.getAddress());
        }

        User savedUser = userRepository.save(existingUser);
        return mapToResponse(savedUser);
    }

    private UserResponse mapToResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .address(user.getAddress())
                .agreement(user.isAgreement())
                .role(user.getRole())
                .status(user.getStatus())
                .build();
    }
}
