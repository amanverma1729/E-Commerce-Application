package com.ecommerce.com.ecommerce.flash.service;

import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import com.ecommerce.com.ecommerce.flash.dto.UserResponse;
import com.ecommerce.com.ecommerce.flash.dto.UserUpdateRequest;
import com.ecommerce.com.ecommerce.flash.entity.User;
import com.ecommerce.com.ecommerce.flash.exception.ResourceNotFoundException;
import com.ecommerce.com.ecommerce.flash.exception.UnauthorizedException;
import com.ecommerce.com.ecommerce.flash.repository.UserRepository;
import com.ecommerce.com.ecommerce.flash.security.UserPrincipal;
import com.ecommerce.com.ecommerce.flash.service.impl.UserServiceImpl;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserServiceImpl userService;

    private User user;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(100L);
        user.setName("Alice");
        user.setEmail("alice@test.com");
        user.setRole("ROLE_USER");

        UserPrincipal principal = UserPrincipal.create(user);
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    @Test
    void testGetUserById_Success() {
        when(userRepository.findById(100L)).thenReturn(Optional.of(user));

        UserResponse response = userService.getUserById(100L);

        assertNotNull(response);
        assertEquals("Alice", response.getName());
        assertEquals("alice@test.com", response.getEmail());
    }

    @Test
    void testGetUserById_NotFound_ThrowsException() {
        User otherUser = new User();
        otherUser.setId(999L);
        otherUser.setName("Other");
        otherUser.setEmail("other@test.com");
        otherUser.setRole("ROLE_USER");

        UserPrincipal principal = UserPrincipal.create(otherUser);
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(auth);

        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> userService.getUserById(999L));
    }

    @Test
    void testUpdateUser_Unauthorized_ThrowsException() {
        // Current user is 100L trying to update user 200L
        UserUpdateRequest request = new UserUpdateRequest("Hacked Name", "12345", "Address");

        assertThrows(UnauthorizedException.class, () -> userService.updateUser(200L, request));
    }
}
