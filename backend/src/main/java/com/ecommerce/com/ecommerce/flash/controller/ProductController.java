package com.ecommerce.com.ecommerce.flash.controller;

import java.io.IOException;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.ecommerce.com.ecommerce.flash.dto.ApiResponse;
import com.ecommerce.com.ecommerce.flash.dto.PageResponse;
import com.ecommerce.com.ecommerce.flash.dto.ProductRequest;
import com.ecommerce.com.ecommerce.flash.dto.ProductResponse;
import com.ecommerce.com.ecommerce.flash.service.ProductService;

@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"}, allowCredentials = "true")
@RestController
@RequestMapping({"/api/v1/products", "/products"})
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public ResponseEntity<?> getProducts(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @RequestParam(required = false) String sort) {

        if (page != null || size != null || search != null || category != null || minPrice != null || maxPrice != null || sort != null) {
            int pageNum = page != null ? page : 0;
            int pageSize = size != null ? size : 10;
            PageResponse<ProductResponse> paginated = productService.getApprovedProductsPaginated(search, category, minPrice, maxPrice, pageNum, pageSize, sort);
            return ResponseEntity.ok(ApiResponse.success("Products retrieved successfully", paginated));
        }

        List<ProductResponse> products = productService.getAllProducts();
        return ResponseEntity.ok(ApiResponse.success("Products retrieved successfully", products));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<PageResponse<ProductResponse>>> searchProducts(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id,desc") String sort) {
        PageResponse<ProductResponse> pageResponse = productService.getApprovedProductsPaginated(search, category, minPrice, maxPrice, page, size, sort);
        return ResponseEntity.ok(ApiResponse.success("Products retrieved successfully", pageResponse));
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
