package com.ecommerce.com.ecommerce.flash.service.impl;

import java.util.Base64;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ecommerce.com.ecommerce.flash.dto.PageResponse;
import com.ecommerce.com.ecommerce.flash.dto.ProductOwnerResponse;
import com.ecommerce.com.ecommerce.flash.dto.ProductRequest;
import com.ecommerce.com.ecommerce.flash.dto.ProductResponse;
import com.ecommerce.com.ecommerce.flash.entity.Product;
import com.ecommerce.com.ecommerce.flash.entity.ProductOwner;
import com.ecommerce.com.ecommerce.flash.entity.ProductStatus;
import com.ecommerce.com.ecommerce.flash.exception.BadRequestException;
import com.ecommerce.com.ecommerce.flash.exception.ResourceNotFoundException;
import com.ecommerce.com.ecommerce.flash.exception.UnauthorizedException;
import com.ecommerce.com.ecommerce.flash.repository.ProductOwnerRepository;
import com.ecommerce.com.ecommerce.flash.repository.ProductRepository;
import com.ecommerce.com.ecommerce.flash.repository.specification.ProductSpecification;
import com.ecommerce.com.ecommerce.flash.security.SecurityUtils;
import com.ecommerce.com.ecommerce.flash.security.UserPrincipal;
import com.ecommerce.com.ecommerce.flash.service.ProductService;

@Service
public class ProductServiceImpl implements ProductService {

    private static final int MAX_PAGE_SIZE = 50;

    private final ProductRepository productRepository;
    private final ProductOwnerRepository productOwnerRepository;

    public ProductServiceImpl(ProductRepository productRepository, ProductOwnerRepository productOwnerRepository) {
        this.productRepository = productRepository;
        this.productOwnerRepository = productOwnerRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductResponse> getAllProducts() {
        List<Product> products;
        if (SecurityUtils.isAdmin()) {
            products = productRepository.findAll();
        } else {
            products = productRepository.findByApproved(true);
        }
        return products.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductResponse> getApprovedProducts() {
        return productRepository.findByApproved(true).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ProductResponse> getApprovedProductsPaginated(
            String search, String category, Double minPrice, Double maxPrice, int page, int size, String sort) {

        if (page < 0) page = 0;
        if (size <= 0) size = 10;
        if (size > MAX_PAGE_SIZE) size = MAX_PAGE_SIZE;

        if (minPrice != null && minPrice < 0) {
            throw new BadRequestException("Minimum price cannot be negative.");
        }
        if (maxPrice != null && maxPrice < 0) {
            throw new BadRequestException("Maximum price cannot be negative.");
        }
        if (minPrice != null && maxPrice != null && minPrice > maxPrice) {
            throw new BadRequestException("Minimum price cannot be greater than maximum price.");
        }

        Sort sortObj = parseSort(sort);
        Pageable pageable = PageRequest.of(page, size, sortObj);

        Specification<Product> spec = ProductSpecification.filterProducts(search, category, minPrice, maxPrice, true);
        Page<Product> productPage = productRepository.findAll(spec, pageable);

        Page<ProductResponse> dtoPage = productPage.map(this::mapToResponse);
        return PageResponse.fromPage(dtoPage);
    }

    private Sort parseSort(String sortParam) {
        if (sortParam == null || sortParam.trim().isEmpty()) {
            return Sort.by(Sort.Direction.DESC, "id");
        }
        String[] parts = sortParam.split(",");
        String property = parts[0].trim();
        Sort.Direction direction = Sort.Direction.ASC;
        if (parts.length > 1 && "desc".equalsIgnoreCase(parts[1].trim())) {
            direction = Sort.Direction.DESC;
        }

        // Whitelist allowed sort fields
        if (!List.of("id", "price", "name", "category", "createdAt").contains(property)) {
            property = "id";
        }
        return Sort.by(direction, property);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + id));

        if (!product.isApproved()) {
            Long ownerId = product.getProductOwner() != null ? product.getProductOwner().getProductOwnerId() : null;
            if (!SecurityUtils.isOwnerOrAdmin(ownerId)) {
                throw new ResourceNotFoundException("Product not found with ID: " + id);
            }
        }
        return mapToResponse(product);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductResponse> getProductsByOwnerId(Long ownerId) {
        return productRepository.findByProductOwner_ProductOwnerId(ownerId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ProductResponse createProduct(ProductRequest request, byte[] imageBytes) {
        Product product = new Product();
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setStock(request.getStock());
        product.setCategory(request.getCategory());
        product.setAvailable(request.isAvailable());

        // Enforce product approval workflow
        product.setApproved(false);
        product.setStatus(ProductStatus.PENDING);

        product.setProductSizes(request.getProductSizes() != null ? request.getProductSizes() : Collections.emptyList());
        product.setProductColors(request.getProductColors() != null ? request.getProductColors() : Collections.emptyList());

        if (imageBytes != null && imageBytes.length > 0) {
            product.setProductImage(imageBytes);
        } else if (request.getProductImageBase64() != null && !request.getProductImageBase64().isEmpty()) {
            String imgBase64 = request.getProductImageBase64();
            if (imgBase64.contains(",")) {
                imgBase64 = imgBase64.split(",")[1];
            }
            product.setProductImage(Base64.getDecoder().decode(imgBase64));
        }

        ProductOwner owner = productOwnerRepository.findById(request.getProductOwnerId())
                .orElseThrow(() -> new ResourceNotFoundException("Product owner not found with ID: " + request.getProductOwnerId()));
        product.setProductOwner(owner);

        Product savedProduct = productRepository.save(product);
        return mapToResponse(savedProduct);
    }

    @Override
    @Transactional
    public ProductResponse updateProduct(Long id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + id));

        // Check seller ownership
        UserPrincipal principal = SecurityUtils.getCurrentUserPrincipal();
        if (principal != null && "ROLE_SELLER".equals(principal.getRole())) {
            if (product.getProductOwner() == null || !product.getProductOwner().getProductOwnerId().equals(principal.getId())) {
                throw new UnauthorizedException("You can only modify your own products.");
            }
        }

        if (request.getName() != null) product.setName(request.getName());
        if (request.getDescription() != null) product.setDescription(request.getDescription());
        if (request.getPrice() > 0) product.setPrice(request.getPrice());
        product.setStock(request.getStock());
        if (request.getCategory() != null) product.setCategory(request.getCategory());
        if (request.getProductSizes() != null) product.setProductSizes(request.getProductSizes());
        if (request.getProductColors() != null) product.setProductColors(request.getProductColors());

        String imgBase64 = request.getProductImageBase64();
        if (imgBase64 != null && !imgBase64.isEmpty()) {
            if (imgBase64.contains(",")) {
                imgBase64 = imgBase64.split(",")[1];
            }
            product.setProductImage(Base64.getDecoder().decode(imgBase64));
        }

        Product saved = productRepository.save(product);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + id));

        UserPrincipal principal = SecurityUtils.getCurrentUserPrincipal();
        if (principal != null && "ROLE_SELLER".equals(principal.getRole())) {
            if (product.getProductOwner() == null || !product.getProductOwner().getProductOwnerId().equals(principal.getId())) {
                throw new UnauthorizedException("You can only delete your own products.");
            }
        }

        if (product.getProductSizes() != null) product.getProductSizes().clear();
        if (product.getProductColors() != null) product.getProductColors().clear();
        productRepository.save(product);
        productRepository.delete(product);
    }

    @Override
    @Transactional
    public ProductResponse approveProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + id));

        product.setApproved(true);
        product.setStatus(ProductStatus.APPROVED);
        Product saved = productRepository.save(product);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public ProductResponse rejectProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + id));

        product.setApproved(false);
        product.setStatus(ProductStatus.REJECTED);
        Product saved = productRepository.save(product);
        return mapToResponse(saved);
    }

    private ProductResponse mapToResponse(Product product) {
        ProductOwnerResponse ownerResponse = null;
        if (product.getProductOwner() != null) {
            ProductOwner owner = product.getProductOwner();
            ownerResponse = ProductOwnerResponse.builder()
                    .productOwnerId(owner.getProductOwnerId())
                    .productOwnerName(owner.getProductOwnerName())
                    .productOwnerEmail(owner.getProductOwnerEmail())
                    .productOwnerNumber(owner.getProductOwnerNumber())
                    .build();
        }

        String imgBase64 = null;
        if (product.getProductImage() != null) {
            imgBase64 = Base64.getEncoder().encodeToString(product.getProductImage());
        }

        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .stock(product.getStock())
                .category(product.getCategory())
                .available(product.isAvailable())
                .productSizes(product.getProductSizes())
                .productColors(product.getProductColors())
                .productImageBase64(imgBase64)
                .productOwner(ownerResponse)
                .approved(product.isApproved())
                .status(product.getStatus() != null ? product.getStatus().name() : "PENDING")
                .build();
    }
}
