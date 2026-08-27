package com.ecommerce.com.ecommerce.flash.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.ecommerce.com.ecommerce.flash.dto.ApiResponse;
import com.ecommerce.com.ecommerce.flash.dto.ProductOwnerResponse;
import com.ecommerce.com.ecommerce.flash.dto.ProductOwnerUpdateRequest;
import com.ecommerce.com.ecommerce.flash.service.ProductOwnerService;

import jakarta.validation.Valid;

@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"}, allowCredentials = "true")
@RestController
@RequestMapping("/product-owners")
public class ProductOwnerController {

    private final ProductOwnerService productOwnerService;

    public ProductOwnerController(ProductOwnerService productOwnerService) {
        this.productOwnerService = productOwnerService;
    }

    @GetMapping({"/email/{email}", "/{email:.+@.+\\..+}"})
    public ResponseEntity<ApiResponse<ProductOwnerResponse>> getProductOwnerByEmail(@PathVariable String email) {
        ProductOwnerResponse response = productOwnerService.getProductOwnerByEmail(email);
        return ResponseEntity.ok(ApiResponse.success("Seller profile retrieved successfully", response));
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<ProductOwnerResponse>>> getAllProductOwners() {
        List<ProductOwnerResponse> responses = productOwnerService.getAllProductOwners();
        return ResponseEntity.ok(ApiResponse.success("Product owners retrieved successfully", responses));
    }

    @GetMapping("/{ownerId}")
    public ResponseEntity<ApiResponse<ProductOwnerResponse>> getProductOwnerById(@PathVariable Long ownerId) {
        ProductOwnerResponse response = productOwnerService.getProductOwnerById(ownerId);
        return ResponseEntity.ok(ApiResponse.success("Seller profile retrieved successfully", response));
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<ApiResponse<ProductOwnerResponse>> updateProductOwner(@PathVariable Long id, @Valid @RequestBody ProductOwnerUpdateRequest updateRequest) {
        ProductOwnerResponse response = productOwnerService.updateProductOwner(id, updateRequest);
        return ResponseEntity.ok(ApiResponse.success("Product owner updated successfully", response));
    }
}
