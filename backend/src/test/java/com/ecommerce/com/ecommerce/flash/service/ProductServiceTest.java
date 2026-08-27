package com.ecommerce.com.ecommerce.flash.service;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import com.ecommerce.com.ecommerce.flash.dto.ProductRequest;
import com.ecommerce.com.ecommerce.flash.dto.ProductResponse;
import com.ecommerce.com.ecommerce.flash.entity.Product;
import com.ecommerce.com.ecommerce.flash.entity.ProductOwner;
import com.ecommerce.com.ecommerce.flash.entity.ProductStatus;
import com.ecommerce.com.ecommerce.flash.exception.ResourceNotFoundException;
import com.ecommerce.com.ecommerce.flash.repository.ProductOwnerRepository;
import com.ecommerce.com.ecommerce.flash.repository.ProductRepository;
import com.ecommerce.com.ecommerce.flash.service.impl.ProductServiceImpl;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private ProductOwnerRepository productOwnerRepository;

    @InjectMocks
    private ProductServiceImpl productService;

    private ProductOwner owner;
    private Product product;

    @BeforeEach
    void setUp() {
        owner = new ProductOwner();
        owner.setProductOwnerId(1L);
        owner.setProductOwnerName("Test Seller");
        owner.setProductOwnerEmail("seller@test.com");

        product = new Product();
        product.setId(100L);
        product.setName("Test Laptop");
        product.setPrice(999.99);
        product.setStock(10);
        product.setCategory("Electronics");
        product.setProductOwner(owner);
        product.setApproved(false);
        product.setStatus(ProductStatus.PENDING);
    }

    @Test
    void testCreateProduct_StartsPending() {
        ProductRequest request = new ProductRequest("Test Laptop", "High performance", 999.99, 10, "Electronics", 1L, true, null, null, null);

        when(productOwnerRepository.findById(1L)).thenReturn(Optional.of(owner));
        when(productRepository.save(any(Product.class))).thenAnswer(invocation -> {
            Product p = invocation.getArgument(0);
            p.setId(100L);
            return p;
        });

        ProductResponse response = productService.createProduct(request, null);

        assertNotNull(response);
        assertEquals("Test Laptop", response.getName());
        assertFalse(response.isApproved());
        assertEquals("PENDING", response.getStatus());
        verify(productRepository).save(any(Product.class));
    }

    @Test
    void testGetProductById_NotFound_ThrowsException() {
        when(productRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> productService.getProductById(999L));
    }

    @Test
    void testApproveProduct_Success() {
        when(productRepository.findById(100L)).thenReturn(Optional.of(product));
        when(productRepository.save(any(Product.class))).thenAnswer(inv -> inv.getArgument(0));

        ProductResponse response = productService.approveProduct(100L);

        assertTrue(response.isApproved());
        assertEquals("APPROVED", response.getStatus());
    }

    @Test
    void testRejectProduct_Success() {
        when(productRepository.findById(100L)).thenReturn(Optional.of(product));
        when(productRepository.save(any(Product.class))).thenAnswer(inv -> inv.getArgument(0));

        ProductResponse response = productService.rejectProduct(100L);

        assertFalse(response.isApproved());
        assertEquals("REJECTED", response.getStatus());
    }
}
