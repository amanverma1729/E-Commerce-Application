package com.ecommerce.com.ecommerce.flash.service;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import com.ecommerce.com.ecommerce.flash.dto.PageResponse;
import com.ecommerce.com.ecommerce.flash.dto.ProductResponse;
import com.ecommerce.com.ecommerce.flash.entity.Product;
import com.ecommerce.com.ecommerce.flash.entity.ProductStatus;
import com.ecommerce.com.ecommerce.flash.exception.BadRequestException;
import com.ecommerce.com.ecommerce.flash.repository.ProductOwnerRepository;
import com.ecommerce.com.ecommerce.flash.repository.ProductRepository;
import com.ecommerce.com.ecommerce.flash.service.impl.ProductServiceImpl;

@ExtendWith(MockitoExtension.class)
class ProductSearchAndPaginationTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private ProductOwnerRepository productOwnerRepository;

    @InjectMocks
    private ProductServiceImpl productService;

    private Product product1;
    private Product product2;

    @BeforeEach
    void setUp() {
        product1 = new Product();
        product1.setId(1L);
        product1.setName("Gaming Laptop");
        product1.setDescription("High performance gaming laptop");
        product1.setPrice(1200.0);
        product1.setCategory("Electronics");
        product1.setApproved(true);
        product1.setAvailable(true);
        product1.setStatus(ProductStatus.APPROVED);

        product2 = new Product();
        product2.setId(2L);
        product2.setName("Wireless Headset");
        product2.setDescription("Noise cancelling wireless headset");
        product2.setPrice(150.0);
        product2.setCategory("Electronics");
        product2.setApproved(true);
        product2.setAvailable(true);
        product2.setStatus(ProductStatus.APPROVED);
    }

    @Test
    void testGetApprovedProductsPaginated_Success() {
        Page<Product> page = new PageImpl<>(List.of(product1, product2));
        when(productRepository.findAll(any(Specification.class), any(Pageable.class))).thenReturn(page);

        PageResponse<ProductResponse> response = productService.getApprovedProductsPaginated(
                "gaming", "Electronics", 100.0, 2000.0, 0, 10, "price,desc");

        assertNotNull(response);
        assertEquals(2, response.getContent().size());
        assertEquals(0, response.getPage());
        assertEquals(2, response.getTotalElements());
        assertTrue(response.isFirst());
        assertTrue(response.isLast());
        verify(productRepository).findAll(any(Specification.class), any(Pageable.class));
    }

    @Test
    void testGetApprovedProductsPaginated_InvalidPriceRange_ThrowsException() {
        assertThrows(BadRequestException.class, () -> 
            productService.getApprovedProductsPaginated(null, null, 500.0, 100.0, 0, 10, "price,asc")
        );
    }

    @Test
    void testGetApprovedProductsPaginated_NegativeMinPrice_ThrowsException() {
        assertThrows(BadRequestException.class, () -> 
            productService.getApprovedProductsPaginated(null, null, -50.0, 100.0, 0, 10, "price,asc")
        );
    }

    @Test
    void testGetApprovedProductsPaginated_EnforcesMaxPageSize() {
        Page<Product> page = new PageImpl<>(List.of(product1), PageRequest.of(0, 50), 1);
        when(productRepository.findAll(any(Specification.class), any(Pageable.class))).thenReturn(page);

        PageResponse<ProductResponse> response = productService.getApprovedProductsPaginated(
                null, null, null, null, 0, 500, "price,asc");

        assertNotNull(response);
        assertEquals(50, response.getSize()); // Max size enforced to 50
    }
}
