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
        // Upgrade legacy plaintext password if matching
        checkAndMigrateLegacyPassword(authRequest.getEmail(), authRequest.getPassword());

        Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(authRequest.getEmail(), authRequest.getPassword())
            );
        } catch (Exception ex) {
            throw new BadCredentialsException("Invalid email or password");
        }

        SecurityContextHolder.getContext().setAuthentication(authentication);
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();

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
        if (userRepository.findByEmail(request.getEmail()).isPresent() ||
            productOwnerRepository.findByProductOwnerEmail(request.getEmail()).isPresent() ||
            adminRepository.findByAdminEmail(request.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email address is already in use");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPhoneNumber(request.getPhoneNumber());
        user.setAddress(request.getAddress());
        user.setAgreement(request.isAgreement());
        user.setRole("ROLE_USER");
        user.setStatus("ACTIVE");

        User savedUser = userRepository.save(user);

        AuthRequest authRequest = new AuthRequest(request.getEmail(), request.getPassword());
        return login(authRequest);
    }

    @Override
    @Transactional
    public AuthResponse registerSeller(SellerRegisterRequest request) {
        if (userRepository.findByEmail(request.getProductOwnerEmail()).isPresent() ||
            productOwnerRepository.findByProductOwnerEmail(request.getProductOwnerEmail()).isPresent() ||
            adminRepository.findByAdminEmail(request.getProductOwnerEmail()).isPresent()) {
            throw new IllegalArgumentException("Email address is already in use");
        }

        ProductOwner owner = new ProductOwner();
        owner.setProductOwnerName(request.getProductOwnerName());
        owner.setProductOwnerEmail(request.getProductOwnerEmail());
        owner.setProductOwnerPassword(passwordEncoder.encode(request.getProductOwnerPassword()));
        owner.setProductOwnerNumber(request.getProductOwnerNumber());

        productOwnerRepository.save(owner);

        AuthRequest authRequest = new AuthRequest(request.getProductOwnerEmail(), request.getProductOwnerPassword());
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
