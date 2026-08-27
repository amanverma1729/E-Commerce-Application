package com.ecommerce.com.ecommerce.flash.service;

import java.util.List;

import com.ecommerce.com.ecommerce.flash.dto.PageResponse;
import com.ecommerce.com.ecommerce.flash.dto.ProductRequest;
import com.ecommerce.com.ecommerce.flash.dto.ProductResponse;

public interface ProductService {
    List<ProductResponse> getAllProducts();
    List<ProductResponse> getApprovedProducts();
    PageResponse<ProductResponse> getApprovedProductsPaginated(String search, String category, Double minPrice, Double maxPrice, int page, int size, String sort);
    ProductResponse getProductById(Long id);
    List<ProductResponse> getProductsByOwnerId(Long ownerId);
    ProductResponse createProduct(ProductRequest request, byte[] imageBytes);
    ProductResponse updateProduct(Long id, ProductRequest request);
    void deleteProduct(Long id);
    ProductResponse approveProduct(Long id);
    ProductResponse rejectProduct(Long id);
}
