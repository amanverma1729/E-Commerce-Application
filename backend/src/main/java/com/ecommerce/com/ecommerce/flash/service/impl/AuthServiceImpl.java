package com.ecommerce.com.ecommerce.flash.service.impl;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ecommerce.com.ecommerce.flash.dto.AuthRequest;
import com.ecommerce.com.ecommerce.flash.dto.AuthResponse;
import com.ecommerce.com.ecommerce.flash.dto.RegisterRequest;
import com.ecommerce.com.ecommerce.flash.dto.SellerRegisterRequest;
import com.ecommerce.com.ecommerce.flash.entity.Admin;
import com.ecommerce.com.ecommerce.flash.entity.ProductOwner;
import com.ecommerce.com.ecommerce.flash.entity.User;
import com.ecommerce.com.ecommerce.flash.repository.AdminRepository;
import com.ecommerce.com.ecommerce.flash.repository.ProductOwnerRepository;
import com.ecommerce.com.ecommerce.flash.repository.UserRepository;
import com.ecommerce.com.ecommerce.flash.security.JwtTokenProvider;
import com.ecommerce.com.ecommerce.flash.security.UserPrincipal;
import com.ecommerce.com.ecommerce.flash.service.AuthService;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class AuthServiceImpl implements AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductOwnerRepository productOwnerRepository;

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Override
    @Transactional
    public AuthResponse login(AuthRequest authRequest) {
        String cleanEmail = authRequest.getEmail() != null ? authRequest.getEmail().trim().toLowerCase() : "";
        String rawPassword = authRequest.getPassword() != null ? authRequest.getPassword().trim() : "";

        // Upgrade legacy plaintext password if matching
        checkAndMigrateLegacyPassword(cleanEmail, rawPassword);

        Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(cleanEmail, rawPassword)
            );
        } catch (Exception ex) {
            log.warn("Authentication failed for email: {} - {}", cleanEmail, ex.getMessage());
            throw new BadCredentialsException("Invalid email or password");
        }

        SecurityContextHolder.getContext().setAuthentication(authentication);
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        log.info("User successfully authenticated: email={}, role={}", principal.getEmail(), principal.getRole());

        String accessToken = tokenProvider.generateAccessToken(authentication);
        String refreshToken = tokenProvider.generateRefreshToken(authentication);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .id(principal.getId())
                .name(principal.getName())
                .email(principal.getEmail())
                .role(principal.getRole())
                .build();
    }

    @Override
    @Transactional
    public AuthResponse registerUser(RegisterRequest request) {
        String cleanEmail = request.getEmail() != null ? request.getEmail().trim().toLowerCase() : "";
        String rawPassword = request.getPassword() != null ? request.getPassword().trim() : "";

        if (userRepository.findByEmail(cleanEmail).isPresent() ||
            productOwnerRepository.findByProductOwnerEmail(cleanEmail).isPresent() ||
            adminRepository.findByAdminEmail(cleanEmail).isPresent()) {
            throw new IllegalArgumentException("Email address is already in use");
        }

        User user = new User();
        user.setName(request.getName() != null ? request.getName().trim() : "");
        user.setEmail(cleanEmail);
        user.setPassword(passwordEncoder.encode(rawPassword));
        user.setPhoneNumber(request.getPhoneNumber());
        user.setAddress(request.getAddress());
        user.setAgreement(request.isAgreement());
        user.setRole("ROLE_USER");
        user.setStatus("ACTIVE");

        User savedUser = userRepository.save(user);

        AuthRequest authRequest = new AuthRequest(cleanEmail, rawPassword);
        return login(authRequest);
    }

    @Override
    @Transactional
    public AuthResponse registerSeller(SellerRegisterRequest request) {
        String cleanEmail = request.getProductOwnerEmail() != null ? request.getProductOwnerEmail().trim().toLowerCase() : "";
        String rawPassword = request.getProductOwnerPassword() != null ? request.getProductOwnerPassword().trim() : "";

        if (userRepository.findByEmail(cleanEmail).isPresent() ||
            productOwnerRepository.findByProductOwnerEmail(cleanEmail).isPresent() ||
            adminRepository.findByAdminEmail(cleanEmail).isPresent()) {
            throw new IllegalArgumentException("Email address is already in use");
        }

        ProductOwner owner = new ProductOwner();
        owner.setProductOwnerName(request.getProductOwnerName() != null ? request.getProductOwnerName().trim() : "");
        owner.setProductOwnerEmail(cleanEmail);
        owner.setProductOwnerPassword(passwordEncoder.encode(rawPassword));
        owner.setProductOwnerNumber(request.getProductOwnerNumber());

        productOwnerRepository.save(owner);

        AuthRequest authRequest = new AuthRequest(cleanEmail, rawPassword);
        return login(authRequest);
    }

    @Override
    public AuthResponse refreshToken(String refreshToken) {
        if (!tokenProvider.validateToken(refreshToken) || !tokenProvider.isRefreshToken(refreshToken)) {
            throw new IllegalArgumentException("Invalid refresh token");
        }

        String username = tokenProvider.getUsernameFromToken(refreshToken);
        Optional<User> userOpt = userRepository.findByEmail(username);
        if (userOpt.isPresent()) {
            UserPrincipal principal = UserPrincipal.create(userOpt.get());
            Authentication auth = new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());
            String newAccessToken = tokenProvider.generateAccessToken(auth);
            return AuthResponse.builder()
                    .accessToken(newAccessToken)
                    .refreshToken(refreshToken)
                    .tokenType("Bearer")
                    .id(principal.getId())
                    .name(principal.getName())
                    .email(principal.getEmail())
                    .role(principal.getRole())
                    .build();
        }

        Optional<ProductOwner> ownerOpt = productOwnerRepository.findByProductOwnerEmail(username);
        if (ownerOpt.isPresent()) {
            UserPrincipal principal = UserPrincipal.create(ownerOpt.get());
            Authentication auth = new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());
            String newAccessToken = tokenProvider.generateAccessToken(auth);
            return AuthResponse.builder()
                    .accessToken(newAccessToken)
                    .refreshToken(refreshToken)
                    .tokenType("Bearer")
                    .id(principal.getId())
                    .name(principal.getName())
                    .email(principal.getEmail())
                    .role(principal.getRole())
                    .build();
        }

        Optional<Admin> adminOpt = adminRepository.findByAdminEmail(username);
        if (adminOpt.isPresent()) {
            UserPrincipal principal = UserPrincipal.create(adminOpt.get());
            Authentication auth = new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());
            String newAccessToken = tokenProvider.generateAccessToken(auth);
            return AuthResponse.builder()
                    .accessToken(newAccessToken)
                    .refreshToken(refreshToken)
                    .tokenType("Bearer")
                    .id(principal.getId())
                    .name(principal.getName())
                    .email(principal.getEmail())
                    .role(principal.getRole())
                    .build();
        }

        throw new IllegalArgumentException("User not found for refresh token");
    }

    private void checkAndMigrateLegacyPassword(String email, String rawPassword) {
        // Upgrade User plaintext password
        userRepository.findByEmail(email).ifPresent(user -> {
            if (!user.getPassword().startsWith("$2a$") && !user.getPassword().startsWith("$2b$") && user.getPassword().equals(rawPassword)) {
                user.setPassword(passwordEncoder.encode(rawPassword));
                userRepository.save(user);
            }
        });

        // Upgrade Seller plaintext password
        productOwnerRepository.findByProductOwnerEmail(email).ifPresent(owner -> {
            if (!owner.getProductOwnerPassword().startsWith("$2a$") && !owner.getProductOwnerPassword().startsWith("$2b$") && owner.getProductOwnerPassword().equals(rawPassword)) {
                owner.setProductOwnerPassword(passwordEncoder.encode(rawPassword));
                productOwnerRepository.save(owner);
            }
        });

        // Upgrade Admin plaintext password
        adminRepository.findByAdminEmail(email).ifPresent(admin -> {
            if (!admin.getAdminPassword().startsWith("$2a$") && !admin.getAdminPassword().startsWith("$2b$") && admin.getAdminPassword().equals(rawPassword)) {
                admin.setAdminPassword(passwordEncoder.encode(rawPassword));
                adminRepository.save(admin);
            }
        });
    }
}
