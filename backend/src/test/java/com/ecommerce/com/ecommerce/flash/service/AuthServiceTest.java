package com.ecommerce.com.ecommerce.flash.service;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.ecommerce.com.ecommerce.flash.dto.AuthRequest;
import com.ecommerce.com.ecommerce.flash.dto.AuthResponse;
import com.ecommerce.com.ecommerce.flash.dto.RegisterRequest;
import com.ecommerce.com.ecommerce.flash.entity.User;
import com.ecommerce.com.ecommerce.flash.repository.AdminRepository;
import com.ecommerce.com.ecommerce.flash.repository.ProductOwnerRepository;
import com.ecommerce.com.ecommerce.flash.repository.UserRepository;
import com.ecommerce.com.ecommerce.flash.security.JwtTokenProvider;
import com.ecommerce.com.ecommerce.flash.security.UserPrincipal;
import com.ecommerce.com.ecommerce.flash.service.impl.AuthServiceImpl;

@ExtendWith(MockitoExtension.class)
public class AuthServiceTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ProductOwnerRepository productOwnerRepository;

    @Mock
    private AdminRepository adminRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider tokenProvider;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private AuthServiceImpl authService;

    private User sampleUser;

    @BeforeEach
    public void setUp() {
        sampleUser = new User();
        sampleUser.setId(1L);
        sampleUser.setName("Test User");
        sampleUser.setEmail("test@example.com");
        sampleUser.setPassword("$2a$10$encodedPassword");
        sampleUser.setRole("ROLE_USER");
        sampleUser.setStatus("ACTIVE");
    }

    @Test
    public void testLogin_Success() {
        AuthRequest request = new AuthRequest("test@example.com", "password123");
        UserPrincipal principal = UserPrincipal.create(sampleUser);

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(sampleUser));
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(principal);
        when(tokenProvider.generateAccessToken(authentication)).thenReturn("mockAccessToken");
        when(tokenProvider.generateRefreshToken(authentication)).thenReturn("mockRefreshToken");

        AuthResponse response = authService.login(request);

        assertNotNull(response);
        assertEquals("mockAccessToken", response.getAccessToken());
        assertEquals("mockRefreshToken", response.getRefreshToken());
        assertEquals("test@example.com", response.getEmail());
    }

    @Test
    public void testRegisterUser_DuplicateEmail_ThrowsException() {
        RegisterRequest registerRequest = new RegisterRequest("Test User", "test@example.com", "password123", "1234567890", "Address", true);

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(sampleUser));

        assertThrows(IllegalArgumentException.class, () -> {
            authService.registerUser(registerRequest);
        });
    }

    @Test
    public void testRegisterUser_Success() {
        RegisterRequest registerRequest = new RegisterRequest("New User", "new@example.com", "password123", "1234567890", "Address", true);

        when(userRepository.findByEmail("new@example.com")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("password123")).thenReturn("$2a$10$encodedPassword");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User u = invocation.getArgument(0);
            u.setId(2L);
            return u;
        });

        UserPrincipal principal = UserPrincipal.create(sampleUser);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(principal);
        when(tokenProvider.generateAccessToken(authentication)).thenReturn("mockAccessToken");
        when(tokenProvider.generateRefreshToken(authentication)).thenReturn("mockRefreshToken");

        AuthResponse response = authService.registerUser(registerRequest);

        assertNotNull(response);
        verify(userRepository).save(any(User.class));
    }
}
