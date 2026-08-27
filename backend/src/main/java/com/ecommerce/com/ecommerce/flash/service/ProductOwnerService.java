package com.ecommerce.com.ecommerce.flash.service;

import java.util.List;

import com.ecommerce.com.ecommerce.flash.dto.ProductOwnerResponse;
import com.ecommerce.com.ecommerce.flash.dto.ProductOwnerUpdateRequest;

public interface ProductOwnerService {
    ProductOwnerResponse getProductOwnerById(Long ownerId);
    ProductOwnerResponse getProductOwnerByEmail(String email);
    List<ProductOwnerResponse> getAllProductOwners();
    ProductOwnerResponse updateProductOwner(Long id, ProductOwnerUpdateRequest updateRequest);
}
