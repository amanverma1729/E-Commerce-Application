package com.ecommerce.com.ecommerce.flash.service.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ecommerce.com.ecommerce.flash.dto.ProductOwnerResponse;
import com.ecommerce.com.ecommerce.flash.dto.ProductOwnerUpdateRequest;
import com.ecommerce.com.ecommerce.flash.entity.ProductOwner;
import com.ecommerce.com.ecommerce.flash.exception.ResourceNotFoundException;
import com.ecommerce.com.ecommerce.flash.exception.UnauthorizedException;
import com.ecommerce.com.ecommerce.flash.repository.ProductOwnerRepository;
import com.ecommerce.com.ecommerce.flash.security.SecurityUtils;
import com.ecommerce.com.ecommerce.flash.security.UserPrincipal;
import com.ecommerce.com.ecommerce.flash.service.ProductOwnerService;

@Service
public class ProductOwnerServiceImpl implements ProductOwnerService {

    private final ProductOwnerRepository productOwnerRepository;

    public ProductOwnerServiceImpl(ProductOwnerRepository productOwnerRepository) {
        this.productOwnerRepository = productOwnerRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public ProductOwnerResponse getProductOwnerById(Long ownerId) {
        if (!SecurityUtils.isOwnerOrAdmin(ownerId)) {
            throw new UnauthorizedException("Access denied: Cannot access another seller's profile.");
        }
        ProductOwner owner = productOwnerRepository.findById(ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Product owner not found with ID: " + ownerId));
        return mapToResponse(owner);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductOwnerResponse getProductOwnerByEmail(String email) {
        UserPrincipal principal = SecurityUtils.getCurrentUserPrincipal();
        if (principal == null || (!principal.getEmail().equalsIgnoreCase(email) && !SecurityUtils.isAdmin())) {
            throw new UnauthorizedException("Access denied: Cannot access another seller's profile.");
        }
        ProductOwner owner = productOwnerRepository.findByProductOwnerEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Product owner not found with email: " + email));
        return mapToResponse(owner);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductOwnerResponse> getAllProductOwners() {
        return productOwnerRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ProductOwnerResponse updateProductOwner(Long id, ProductOwnerUpdateRequest updateRequest) {
        if (!SecurityUtils.isOwnerOrAdmin(id)) {
            throw new UnauthorizedException("Access denied: Cannot modify another seller's profile.");
        }
        ProductOwner owner = productOwnerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product owner not found with ID: " + id));

        if (updateRequest.getProductOwnerName() != null) {
            owner.setProductOwnerName(updateRequest.getProductOwnerName());
        }
        if (updateRequest.getProductOwnerNumber() != null) {
            owner.setProductOwnerNumber(updateRequest.getProductOwnerNumber());
        }

        ProductOwner saved = productOwnerRepository.save(owner);
        return mapToResponse(saved);
    }

    private ProductOwnerResponse mapToResponse(ProductOwner owner) {
        return ProductOwnerResponse.builder()
                .productOwnerId(owner.getProductOwnerId())
                .productOwnerName(owner.getProductOwnerName())
                .productOwnerEmail(owner.getProductOwnerEmail())
                .productOwnerNumber(owner.getProductOwnerNumber())
                .build();
    }
}
