package com.ecommerce.com.ecommerce.flash.controller;

import java.io.IOException;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.ecommerce.com.ecommerce.flash.dto.ApiResponse;
import com.ecommerce.com.ecommerce.flash.dto.ProductRequest;
import com.ecommerce.com.ecommerce.flash.dto.ProductResponse;
import com.ecommerce.com.ecommerce.flash.service.ProductService;

import jakarta.validation.Valid;

@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"}, allowCredentials = "true")
@RestController
@RequestMapping("/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ProductResponse>>> getAllProducts() {
        List<ProductResponse> products = productService.getAllProducts();
        return ResponseEntity.ok(ApiResponse.success("Products retrieved successfully", products));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductResponse>> getProductById(@PathVariable Long id) {
        ProductResponse product = productService.getProductById(id);
        return ResponseEntity.ok(ApiResponse.success("Product retrieved successfully", product));
    }

    @GetMapping("/approved")
    public ResponseEntity<ApiResponse<List<ProductResponse>>> getApprovedProducts() {
        List<ProductResponse> approvedProducts = productService.getApprovedProducts();
        return ResponseEntity.ok(ApiResponse.success("Approved products retrieved successfully", approvedProducts));
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ProductResponse>> approveProduct(@PathVariable Long id) {
        ProductResponse response = productService.approveProduct(id);
        return ResponseEntity.ok(ApiResponse.success("Product approved successfully", response));
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ProductResponse>> rejectProduct(@PathVariable Long id) {
        ProductResponse response = productService.rejectProduct(id);
        return ResponseEntity.ok(ApiResponse.success("Product rejected successfully", response));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SELLER', 'ADMIN')")
    public ResponseEntity<ApiResponse<ProductResponse>> updateProduct(@PathVariable Long id, @RequestBody ProductRequest request) {
        ProductResponse response = productService.updateProduct(id, request);
        return ResponseEntity.ok(ApiResponse.success("Product updated successfully", response));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SELLER', 'ADMIN')")
    public ResponseEntity<ApiResponse<String>> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok(ApiResponse.success("Product deleted successfully.", null));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('SELLER', 'ADMIN')")
    public ResponseEntity<ApiResponse<ProductResponse>> addProduct(
            @RequestParam("name") String name,
            @RequestParam("description") String description,
            @RequestParam("price") double price,
            @RequestParam("stock") int stock,
            @RequestParam("category") String category,
            @RequestParam("productOwnerId") Long productOwnerId,
            @RequestParam(value = "productSizes", required = false) String productSizes,
            @RequestParam(value = "productColors", required = false) String productColors,
            @RequestParam(value = "available", defaultValue = "true") boolean available,
            @RequestParam(value = "images", required = false) List<MultipartFile> images
    ) throws IOException {
        ProductRequest request = new ProductRequest();
        request.setName(name);
        request.setDescription(description);
        request.setPrice(price);
        request.setStock(stock);
        request.setCategory(category);
        request.setProductOwnerId(productOwnerId);
        request.setAvailable(available);

        if (productSizes != null && !productSizes.isEmpty()) {
            request.setProductSizes(Arrays.asList(productSizes.split(",")));
        } else {
            request.setProductSizes(Collections.emptyList());
        }
        if (productColors != null && !productColors.isEmpty()) {
            request.setProductColors(Arrays.asList(productColors.split(",")));
        } else {
            request.setProductColors(Collections.emptyList());
        }

        byte[] imageBytes = null;
        if (images != null && !images.isEmpty()) {
            imageBytes = images.get(0).getBytes();
        }

        ProductResponse response = productService.createProduct(request, imageBytes);
        return ResponseEntity.ok(ApiResponse.success("Product added successfully", response));
    }

    @GetMapping("/owner/{ownerId}")
    @PreAuthorize("hasAnyRole('SELLER', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<ProductResponse>>> getProductsByOwner(@PathVariable Long ownerId) {
        List<ProductResponse> products = productService.getProductsByOwnerId(ownerId);
        return ResponseEntity.ok(ApiResponse.success("Seller products retrieved successfully", products));
    }
}
