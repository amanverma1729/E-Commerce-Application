package com.ecommerce.com.ecommerce.flash.security;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.ecommerce.com.ecommerce.flash.entity.Admin;
import com.ecommerce.com.ecommerce.flash.entity.ProductOwner;
import com.ecommerce.com.ecommerce.flash.entity.User;
import com.ecommerce.com.ecommerce.flash.repository.AdminRepository;
import com.ecommerce.com.ecommerce.flash.repository.ProductOwnerRepository;
import com.ecommerce.com.ecommerce.flash.repository.UserRepository;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductOwnerRepository productOwnerRepository;

    @Autowired
    private AdminRepository adminRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        // 1. Search in Customer Users table
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isPresent()) {
            return UserPrincipal.create(userOpt.get());
        }

        // 2. Search in Product Owners (Sellers) table
        Optional<ProductOwner> ownerOpt = productOwnerRepository.findByProductOwnerEmail(email);
        if (ownerOpt.isPresent()) {
            return UserPrincipal.create(ownerOpt.get());
        }

        // 3. Search in Admins table
        Optional<Admin> adminOpt = adminRepository.findByAdminEmail(email);
        if (adminOpt.isPresent()) {
            return UserPrincipal.create(adminOpt.get());
        }

        throw new UsernameNotFoundException("User not found with email: " + email);
    }
}
